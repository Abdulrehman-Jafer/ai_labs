"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuth();
  const { push } = useRouter();

  // useEffect(() => {
  //   if (user) return;
  //   push("/signin");
  // }, [user, push]);
  return (
    <main className="flex">
      <Sidebar />

      <section className="flex-1 flex flex-col min-h-screen">
        <Navbar />

        <main className=" bg-black flex-1">{children}</main>
      </section>
    </main>
  );
}
