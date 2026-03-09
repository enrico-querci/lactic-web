"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CoachIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/coach/programs");
  }, [router]);
  return null;
}
