"use client";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return <div className="animate-fade-in-up">{children}</div>;
}