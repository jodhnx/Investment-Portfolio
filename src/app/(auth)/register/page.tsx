"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
