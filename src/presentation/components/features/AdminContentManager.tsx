"use client";

import { useCallback, useEffect, useState } from "react";
import { 
  Edit3, Trash2, Database,
  Search, RefreshCcw,
  CheckCircle
} from "lucide-react";
import { getAllContent, deleteContent } from "@/core/domain/admin/actions";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/infrastructure/security/headers";

type AdminContentItem = {
  id: string;
  title?: string;
  name?: string;
  slug?: string;
  category?: string;
  created_at?: string;
  issue_date?: string;
} & Record<string, unknown>;

interface AdminContentManagerProps {
  table: string;
  onEdit: (item: AdminContentItem) => void;
}

export default function AdminContentManager({ table, onEdit }: AdminContentManagerProps) {
  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const result = await getAllContent(table);
    if (result.success) {
      setItems((result.data as AdminContentItem[]) || []);
    } else {
      toast.error(`Fetch Failed: ${result.error}`);
    }
    setIsLoading(false);
  }, [table]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to purge this record? This action is irreversible.")) return;

    toast.loading("Purging from cloud...");
    const result = await deleteContent({ table, id, path: '/admin' });
    
    if (result.success) {
      toast.dismiss();
      toast.success("Record purged successfully.");
      setItems(items.filter(i => i.id !== id));
    } else {
      toast.dismiss();
      toast.error("Purge Failed.");
    }
  };

  const filteredItems = items.filter(item => 
    JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${table} vault...`}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-cyan-500 outline-none transition-all"
          />
        </div>
        <button 
          onClick={fetchData}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors border border-slate-700"
        >
          <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Content List */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/30">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Artifact_Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Metadata</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-xs font-mono animate-pulse">
                      DECRYPTING_CLOUD_VAULT...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-xs font-mono">
                      NO_RECORDS_DETECTED
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                            <Database className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-none">{item.title || item.name || 'Untitled_Artifact'}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">{item.slug || item.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synced</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {item.category && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {item.category}
                            </span>
                          )}
                          {(item.created_at || item.issue_date) && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 border border-slate-700">
                              {new Date(String(item.created_at || item.issue_date)).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onEdit(item)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-400 hover:text-white transition-all border border-slate-700"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-all border border-slate-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
