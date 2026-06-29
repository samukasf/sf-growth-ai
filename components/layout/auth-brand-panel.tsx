import {
  APP_NAME,
  LOGIN_FEATURES,
  LOGIN_TAGLINE,
} from "@/constants";

import { FeatureList, Logo } from "@/components/common";

export function AuthBrandPanel() {
  return (
    <div className="relative flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16 xl:px-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_40%,rgba(59,130,246,0.12),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.04),transparent_40%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-lg lg:mx-0">
        <Logo className="mb-10" />

        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {APP_NAME}
        </h1>

        <p className="mt-5 max-w-md text-lg leading-relaxed text-zinc-400">
          {LOGIN_TAGLINE}
        </p>

        <div className="mt-12 border-t border-white/[0.06] pt-10">
          <FeatureList items={LOGIN_FEATURES} />
        </div>
      </div>
    </div>
  );
}
