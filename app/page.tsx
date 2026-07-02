import { supabase } from "@/lib/supabase/client";

export default async function Home() {
  const { data, error } = await supabase
    .from("companies")
    .select("*");

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8">
        SF Growth AI
      </h1>

      <div className="bg-zinc-900 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Teste de conexão com Supabase
        </h2>

        {error ? (
          <div className="text-red-400">
            <p>Erro:</p>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        ) : (
          <div className="text-green-400">
            <p>✅ Conectado com sucesso!</p>

            <pre className="mt-4 text-white">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}