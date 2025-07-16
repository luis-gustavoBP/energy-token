"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { ethers } from "ethers";
import { EnergyCreditsContract } from "../types/contract";
import Image from "next/image";

interface DashboardProps {
  contract: EnergyCreditsContract;
  address: string;
  balance: string;
}

interface TransactionStats {
  totalSent: number;
  totalReceived: number;
  transactionCount: number;
  lastTransaction: string;
}

interface DailyActivity {
  date: string;
  value: number;
}

const PERIOD_OPTIONS = [7, 14, 30];

export default function Dashboard({ contract, address, balance }: DashboardProps) {
  const [stats, setStats] = useState<TransactionStats>({
    totalSent: 0,
    totalReceived: 0,
    transactionCount: 0,
    lastTransaction: ""
  });
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(7);
  const [activity, setActivity] = useState<DailyActivity[]>([]);
  const [error, setError] = useState<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Buscar estatísticas de transações e atividade diária
  const fetchStats = async () => {
    if (!contract || !address) {
      setError("Contrato ou endereço não definido.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Buscar eventos Transfer
      const filterIn = contract.filters.Transfer(null, address);
      const filterOut = contract.filters.Transfer(address, null);
      const maxBlocks = 1000; // ou menos, se necessário
      const [inEvents, outEvents] = await Promise.all([
        contract.queryFilter(filterIn, -maxBlocks),
        contract.queryFilter(filterOut, -maxBlocks),
      ]);

      let totalSent = 0;
      let totalReceived = 0;
      const all = [...inEvents, ...outEvents]
        .sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0))
        .slice(0, 20); // só os 20 mais recentes

      // Mapear eventos por dia
      const now = new Date();
      const days: { [date: string]: number } = {};
      for (let i = 0; i < period; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - (period - 1 - i));
        const key = d.toISOString().slice(0, 10);
        days[key] = 0;
      }

      // Obter provider corretamente (ethers v6)
      const provider = (contract.runner && 'provider' in contract.runner) ? (contract.runner.provider as any) : (contract.provider as any);
      for (const event of all) {
        const args = (event as any).args;
        const blockNumber = (event as any).blockNumber;
        const block = await provider.getBlock(blockNumber);
        const date = new Date(block.timestamp * 1000).toISOString().slice(0, 10);
        const value = Number(ethers.formatUnits(args[2], 18));
        if (days[date] !== undefined) {
          days[date] += value;
        }
        if (args[0].toLowerCase() === address.toLowerCase()) {
          totalSent += value;
        } else {
          totalReceived += value;
        }
      }

      setStats({
        totalSent: Math.round(totalSent * 100) / 100,
        totalReceived: Math.round(totalReceived * 100) / 100,
        transactionCount: all.length,
        lastTransaction: all.length > 0 ? new Date().toLocaleDateString() : "Nunca"
      });
      setActivity(Object.entries(days).map(([date, value]) => ({ date, value })));
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Atualização automática
  useEffect(() => {
    fetchStats();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchStats, 120000); // 2 minutos
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, [contract, address, period]);

  // Calcular métricas derivadas
  const metrics = useMemo(() => {
    const netFlow = stats.totalReceived - stats.totalSent;
    return {
      netFlow: Math.round(netFlow * 100) / 100,
      averageTransaction: stats.transactionCount > 0 
        ? Math.round(((stats.totalSent + stats.totalReceived) / stats.transactionCount) * 100) / 100 
        : 0,
      activityLevel: stats.transactionCount === 0 ? "Inativo" :
                    stats.transactionCount < 5 ? "Baixo" :
                    stats.transactionCount < 20 ? "Médio" : "Alto"
    };
  }, [stats]);

  if (!address) {
    return <div className="text-center text-gray-500">Conecte sua carteira para ver o dashboard.</div>;
  }
  if (!contract) {
    return <div className="text-center text-red-500">Contrato não carregado.</div>;
  }

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl shadow-lg">
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <div className="flex items-center gap-3 mb-6">
        <Image src="/ercdToken.png" alt="ECRD" width={32} height={32} />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h2>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">Período:</span>
          <select
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
            value={period}
            onChange={e => setPeriod(Number(e.target.value))}
          >
            {PERIOD_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt} dias</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500">
          {/* Saldo Atual */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 group relative">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Saldo Atual</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 transition-all duration-500">
              {parseFloat(balance).toFixed(2)} ECRD
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              Disponível para uso
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded shadow">
              Atualizado em tempo real
            </div>
          </div>

          {/* Fluxo Líquido */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 group relative">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fluxo Líquido</div>
            <div className={`text-2xl font-bold ${metrics.netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} transition-all duration-500`}>
              {metrics.netFlow >= 0 ? '+' : ''}{metrics.netFlow} ECRD
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Recebido - Enviado
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded shadow">
              Diferença entre tokens recebidos e enviados
            </div>
          </div>

          {/* Total de Transações */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 group relative">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transações</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 transition-all duration-500">
              {stats.transactionCount}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Nível: {metrics.activityLevel}
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded shadow">
              Total de transações no período
            </div>
          </div>

          {/* Média por Transação */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 group relative">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Média/Tx</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 transition-all duration-500">
              {metrics.averageTransaction} ECRD
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Valor médio
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded shadow">
              Média de tokens por transação
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Atividade Real */}
      <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Atividade Recente</div>
          <span className="text-xs text-gray-500">{period} dias</span>
        </div>
        <div className="flex items-end gap-1 h-24 md:h-32 lg:h-40">
          {activity.map((item, i) => (
            <div
              key={item.date}
              className="flex-1 group relative cursor-pointer"
              style={{ minWidth: 6 }}
            >
              <div
                className={`bg-gradient-to-t from-blue-500 to-blue-300 dark:from-blue-600 dark:to-blue-400 rounded-t transition-all duration-500`}
                style={{ height: `${Math.max(10, (item.value / Math.max(...activity.map(a => a.value), 1)) * 100)}%` }}
              />
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg">
                {item.date}: {item.value.toFixed(2)} ECRD
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>{activity[0]?.date || ""}</span>
          <span>{activity[activity.length - 1]?.date || ""}</span>
        </div>
      </div>

      {/* Resumo de Transações */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Enviado</div>
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
            {stats.totalSent} ECRD
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recebido</div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            {stats.totalReceived} ECRD
          </div>
        </div>
      </div>
    </div>
  );
} 