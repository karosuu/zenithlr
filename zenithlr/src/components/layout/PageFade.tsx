"use client";

import { usePathname } from "@/i18n/routing";

export function PageFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-fade min-w-0">
      {children}
    </div>
  );
}
