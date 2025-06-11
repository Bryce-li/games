"use client";

import { useEffect } from "react";
import '../lib/i18n/config'

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
    // 客户端初始化代码
  }, []);

  return <div className="antialiased">{children}</div>;
}
