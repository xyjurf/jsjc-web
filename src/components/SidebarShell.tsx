"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ToastProvider from "./ToastProvider";

interface SidebarShellProps {
  email: string;
  role?: string | null;
  children: React.ReactNode;
}

export default function SidebarShell({
  email,
  role,
  children,
}: SidebarShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop Sidebar — always visible */}
      <div className="hidden lg:block">
        <Sidebar role={role} />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0">
            <Sidebar role={role} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          email={email}
          onMenuClick={() => setSidebarOpen(true)}
        />
        {children}
      </div>
    </div>
    </ToastProvider>
  );
}