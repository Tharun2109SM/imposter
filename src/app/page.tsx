import { LandingForms } from "@/components/home/landing-forms";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-primary)]" />}>
      <LandingForms />
    </Suspense>
  );
}

