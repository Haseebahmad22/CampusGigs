"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("campusgigs_token");
    const role = localStorage.getItem("campusgigs_role");

    if (!token) {
      router.replace("/signin");
      return;
    }

    if (role === "client") {
      router.replace("/client");
      return;
    }

    router.replace("/freelancer");
  }, [router]);

  return null;
}
