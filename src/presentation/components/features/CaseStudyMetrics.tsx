'use client';

import { TrendingUp, Users, Zap, BarChart3 } from "lucide-react";

export interface CaseStudyMetric {
  label: string;
  value: string;
  icon?: React.ReactNode;
  context?: string;
}

interface CaseStudyMetricsProps {
  metrics: CaseStudyMetric[];
  title?: string;
}

const defaultIcons = {
  performance: <TrendingUp className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  efficiency: <Zap className="h-5 w-5" />,
  analytics: <BarChart3 className="h-5 w-5" />
};

export default function CaseStudyMetrics({
  metrics,
  title = "Measured Impact"
}: CaseStudyMetricsProps) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="space-y-4">
      {title && (
        <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
          {title}
        </h4>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="text-cyan-400 flex-shrink-0 mt-0.5">
                {metric.icon || defaultIcons.analytics}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-cyan-400 truncate">
                  {metric.value}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                  {metric.label}
                </div>
                {metric.context && (
                  <div className="text-[11px] text-slate-500 mt-2 leading-tight">
                    {metric.context}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
