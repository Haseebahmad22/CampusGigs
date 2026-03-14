"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("campusgigs_token");
    const role = localStorage.getItem("campusgigs_role");
    const isPublicFreelancerProfileRoute = /^\/freelancer\/profile\/[^/]+$/.test(pathname);

    if (!token) {
      router.replace("/signin");
      return;
    }

    if (pathname.startsWith("/client") && role === "freelancer") {
      router.replace("/freelancer");
      return;
    }

    if (
      pathname.startsWith("/freelancer") &&
      role === "client" &&
      !isPublicFreelancerProfileRoute
    ) {
      router.replace("/client");
      return;
    }

    setIsAllowed(true);
  }, [pathname, router]);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
