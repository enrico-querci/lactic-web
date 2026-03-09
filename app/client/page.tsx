"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/client/programs");
  }, [router]);
  return null;
}
