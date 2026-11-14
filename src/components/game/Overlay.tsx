import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Overlay({ children, label, alert }: { children: ReactNode; label: string; alert?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label={label}>
      <div className={cn("panel max-h-[92vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-7 animate-float-in", alert && "border-radiation bg-gradient-alert")}>
        {children}
      </div>
    </div>
  );
}
