import { APP_VERSION } from "@/constants";

import { LoginForm } from "@/components/forms";

export function AuthLoginPanel() {
  return (
    <div className="relative flex flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_30%)] lg:bg-none"
      />

      <div className="relative z-10 flex w-full flex-col items-center">
        <LoginForm />
      </div>
    </div>
  );
}

export function AuthFooter() {
  return (
    <footer className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-6">
      <p className="text-xs font-medium tracking-wider text-zinc-600">
        Versão {APP_VERSION}
      </p>
    </footer>
  );
}
