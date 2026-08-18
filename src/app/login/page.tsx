import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6 py-10">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
