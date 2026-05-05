import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { DatabaseWebhookSchema } from '@/core/application/dtos/webhook.dto';
import { HandleDbWebhookUseCase } from '@/core/application/use-cases/HandleDbWebhookUseCase';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-supabase-webhook-secret');
    const secret = process.env.SUPABASE_WEBHOOK_SECRET;

    // 1. Secure Cryptographic Validation (Timing-Safe Comparison)
    if (!secret || !signature || signature.length !== secret.length) {
      console.error('Unauthorized webhook attempt blocked.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature);
    const secretBuffer = Buffer.from(secret);
    
    try {
      if (!timingSafeEqual(signatureBuffer, secretBuffer)) {
        console.error('Unauthorized webhook attempt blocked.');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch {
      console.error('Unauthorized webhook attempt blocked.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();

    // 2. Strict Input Validation (Zod)
    const validatedData = DatabaseWebhookSchema.safeParse(payload);

    if (!validatedData.success) {
      return NextResponse.json({ 
        error: 'Invalid Payload', 
        details: validatedData.error.format() 
      }, { status: 400 });
    }

    // 3. Delegation to Application Layer (Use Case)
    const useCase = new HandleDbWebhookUseCase();
    const result = await useCase.execute(validatedData.data);

    if (!result.success) {
      return NextResponse.json({ error: 'Notification Dispatch Failed' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Notification Processed' }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
