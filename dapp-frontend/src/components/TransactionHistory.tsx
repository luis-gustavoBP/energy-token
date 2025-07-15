"use client";
import { useEffect, useState } from "react";
import { ethers, Provider } from "ethers";

interface Props {
  contract: any;
  address: string;
  provider: Provider;
}

interface TxItem {
  hash: string;
  from: string;
  to: string;
  value: string;
  direction: "in" | "out";
  timestamp: number;
}

export default function TransactionHistory({ contract, address, provider }: Props) {
  const [txs, setTxs] = useState<TxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!contract || !address || !provider) return;
    let ignore = false;
    async function fetchTxs() {
      setLoading(true);
      setError("");
      try {
        // Busca eventos Transfer envolvendo a carteira conectada
        const filterIn = contract.filters.Transfer(null, address);
        const filterOut = contract.filters.Transfer(address, null);
        const [inEvents, outEvents] = await Promise.all([
          contract.queryFilter(filterIn, -10000), // últimos 10k blocos
          contract.queryFilter(filterOut, -10000),
        ]);
        const all = [...inEvents, ...outEvents].sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0));
        // Busca timestamp dos blocos usando provider de leitura
        const items: TxItem[] = await Promise.all(
          all.map(async (ev: any) => {
            const block = await provider.getBlock(ev.blockNumber);
            return {
              hash: ev.transactionHash,
              from: ev.args[0],
              to: ev.args[1],
              value: ethers.formatUnits(ev.args[2], 18),
              direction: ev.args[0].toLowerCase() === address.toLowerCase() ? "out" : "in",
              timestamp: block ? block.timestamp : 0, 
            };
          })
        );
        if (!ignore) setTxs(items);
      } catch (err: any) {
        if (!ignore) setError("Erro ao buscar transações: " + (err.message || err));
      }
      setLoading(false);
    }
    fetchTxs();
    return () => { ignore = true; };
  }, [contract, address, provider]);

  if (!contract || !address) return null;

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded shadow mt-4">
      <div className="font-semibold mb-2">Histórico de Transações (ECRD)</div>
      {loading && <div className="text-xs text-gray-500">Carregando...</div>}
      {error && <div className="text-red-500 text-xs">{error}</div>}
      <div className="flex flex-col gap-2 mt-2">
        {txs.length === 0 && !loading && <div className="text-xs text-gray-400">Nenhuma transação encontrada.</div>}
        {txs.map((tx, idx) => (
          <div key={tx.hash + idx} className={`flex flex-col md:flex-row md:items-center justify-between border rounded px-3 py-2 ${tx.direction === "in" ? "border-green-400" : "border-red-400"} bg-white dark:bg-black`}>
            <div className="font-mono text-xs break-all">
              {tx.direction === "in" ? "Recebido de" : "Enviado para"}: {tx.direction === "in" ? tx.from : tx.to}
            </div>
            <div className={tx.direction === "in" ? "text-green-600 text-base" : "text-red-600 text-base"}>
              {tx.direction === "in" ? "+" : "-"}{tx.value} ECRD
            </div>
            <div className="text-xs text-gray-500">{new Date(tx.timestamp * 1000).toLocaleString()}</div>
            <a href={`https://sepolia.etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-xs underline text-blue-500 ml-2">Ver no Etherscan</a>
          </div>
        ))}
      </div>
    </div>
  );
} 