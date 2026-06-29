import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/constants";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-6 py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            SaaS Platform
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
            {APP_NAME}
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {APP_TAGLINE}
          </p>
          <p className="max-w-lg text-sm leading-6 text-zinc-500 dark:text-zinc-500">
            {APP_DESCRIPTION}
          </p>
        </div>
      </main>
    </div>
  );
}
