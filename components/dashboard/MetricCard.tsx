import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
}) {
  return (
    <Card hoverable className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/60">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
            {value}
          </p>
          {helper ? (
            <p className="mt-1 text-xs text-white/45">{helper}</p>
          ) : null}
        </div>

        {icon ? (
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80">
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
