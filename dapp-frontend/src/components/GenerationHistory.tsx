"use client";
import { useEffect, useState } from "react";

export default function GenerationHistory({ contract, isOwner, address }: { contract: any; isOwner: boolean; address: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!contract || (!isOwner && !address)) return;
    let ignore = false;
    async function fetchHistory() {
      setLoading(true);
      setError("");
      try {
        let count = await contract.generationCount();
        count = Number(count);
        const items = [];
        for (let i = 0; i < count; i++) {
          const gen = await contract.getEnergyGeneration(i);
          if (isOwner || gen[0].toLowerCase() === address.toLowerCase()) {
            items.push({
              user: gen[0],
              amount: gen[1],
              timestamp: Number(gen[2])
            });
          }
        }
        if (!ignore) setHistory(items.reverse());
      } catch (err: any) {
        if (!ignore) setError("Erro ao buscar histórico: " + (err.message || err));
      }
      setLoading(false);
    }
    fetchHistory();
    return () => { ignore = true; };
  }, [contract, isOwner, address]);

  if (!contract) return null;

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl shadow mt-4">
      <div className="font-semibold mb-2">Histórico de Geração de Energia</div>
      {loading && <div className="text-xs text-gray-500">Carregando...</div>}
      {error && <div className="text-red-500 text-xs">{error}</div>}
      <div className="flex flex-col gap-2 mt-2">
        {history.length === 0 && !loading && <div className="text-xs text-gray-400">Nenhum registro encontrado.</div>}
        {history.map((item, idx) => (
          <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2">
            <div className="font-mono text-xs break-all">{item.user}</div>
            <div className="text-xs">{Number(item.amount) / 1e18} ECRD</div>
            <div className="text-xs text-gray-500">{new Date(item.timestamp * 1000).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 