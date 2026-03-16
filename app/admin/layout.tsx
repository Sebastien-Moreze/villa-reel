import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

type Props = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const user = await getCurrentUser();

  return <AdminShell userEmail={user?.email ?? null}>{children}</AdminShell>;
}

