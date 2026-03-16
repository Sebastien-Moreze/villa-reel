'use client';

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

// Placeholder pour un futur système de toast (react-hot-toast, sonner, etc.)
export function ToastProvider({ children }: Props) {
  return <>{children}</>;
}

