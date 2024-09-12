"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuth();
  const { push } = useRouter();

  // useEffect(() => {
  //   if (user) push("/dashboard");
  // }, [user, push]);

  return <>{children}</>;
}
