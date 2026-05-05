import { DatabaseWebhookDTO } from '../dtos/webhook.dto';
import { notifyAdmin } from '@/infrastructure/utils/notifications';
import { upsertKnowledge, deleteKnowledge } from '@/core/domain/ai/mutations';

type WebhookRecord = Record<string, unknown>;
type ResearchSection = {
  title?: string;
  content?: string;
};

export class HandleDbWebhookUseCase {
  async execute(payload: DatabaseWebhookDTO) {
    const { table, type, record, old_record } = payload;

    // 1. AI Synchronization Logic (Grounding)
    if (['projects', 'research'].includes(table)) {
      try {
        if (type === 'DELETE' && old_record?.id) {
          await deleteKnowledge(old_record.id);
        } else if (record?.id) {
          let content = '';
          const metadata: WebhookRecord = {
            type: table === 'projects' ? 'project' : 'research', 
            slug: record.slug, 
            title: record.title 
          };

          if (table === 'projects') {
            content = `Project: ${record.title}\nRole: ${record.role}\nSummary: ${record.summary}\nTools: ${Array.isArray(record.tools) ? record.tools.join(', ') : record.tools}\nDescription: ${record.description}`;
          } else if (table === 'research') {
            content = `Research: ${record.title}\nAbstract: ${record.abstract}\nTags: ${Array.isArray(record.tags) ? record.tags.join(', ') : record.tags}`;
            if (record.content) {
              const sections = typeof record.content === 'string' ? JSON.parse(record.content) : record.content;
              if (Array.isArray(sections)) {
                content += `\n\nStructured Content:\n${(sections as ResearchSection[]).map((section) => `${section.title || 'Section'}:\n${section.content || ''}`).join('\n\n')}`;
              }
            }
          }

          await upsertKnowledge({ id: record.id, content, metadata });
        }
      } catch (aiError) {
        console.error('AI Grounding Sync Failed during webhook:', aiError);
      }
    }

    // 2. Notification Mapping Logic
    let title = `DB ${type}: ${table}`;
    let message = `A ${type} operation was performed on the ${table} table.`;
    let notificationType: 'SYSTEM' | 'INQUIRY' | 'SECURITY' = 'SYSTEM';
    
    // Scrub sensitive internal fields from the data payload
    const scrubbedRecord: WebhookRecord = record ? { ...record } : {};
    delete scrubbedRecord.id;
    delete scrubbedRecord.created_at;
    delete scrubbedRecord.updated_at;

    if (table === 'contacts' && type === 'INSERT') {
      title = "New Portfolio Inquiry";
      message = `New ${record?.interest || 'general'} inquiry from ${record?.name || 'Anonymous'}`;
      notificationType = 'INQUIRY';
    } else if (table === 'security_logs' && record?.severity === 'CRITICAL') {
      title = "CRITICAL SECURITY ALERT";
      message = `Critical security event detected: ${record?.event_type}`;
      notificationType = 'SECURITY';
    } else if (['projects', 'research'].includes(table)) {
      title = `${table === 'projects' ? 'Project' : 'Research'} Updated`;
      message = `${type} operation on ${record?.title || 'a record'}`;
    }

    try {
      await notifyAdmin({
        title,
        message,
        type: notificationType,
        data: scrubbedRecord as Record<string, unknown>
      });
      return { success: true };
    } catch (err) {
      console.error('Notification Dispatch Failed:', err);
      return { success: false };
    }
  }
}
