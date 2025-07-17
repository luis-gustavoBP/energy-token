"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { ethers } from "ethers";
import { EnergyCreditsContract } from "../types/contract";
import Image from "next/image";
import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from 'next-themes';

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

// Adicionar opções de período
const PERIOD_OPTIONS = [
  { label: '24h', value: '24h' },
  { label: '7 dias', value: '7d' },
  { label: '1 mês', value: '30d' }
];

export default function Dashboard({ contract, address, balance }: DashboardProps) {
  const [stats, setStats] = useState<TransactionStats>({
    totalSent: 0,
    totalReceived: 0,
    transactionCount: 0,
    lastTransaction: ""
  });
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('24h');
  const [activity, setActivity] = useState<DailyActivity[]>([]);
  const [error, setError] = useState<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { resolvedTheme } = useTheme();
  const barColor = resolvedTheme === 'dark' ? '#4ade80' : '#16a34a';

  // Detectar o tema (dark/light) para definir a cor da barra
  // const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  // const barColor = isDark ? '#4ade80' : '#16a34a';

  // Buscar estatísticas de transações e atividade por período
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
      const maxBlocks = 2000; // aumentar para pegar mais eventos se necessário
      const [inEvents, outEvents] = await Promise.all([
        contract.queryFilter(filterIn, -maxBlocks),
        contract.queryFilter(filterOut, -maxBlocks),
      ]);

      let totalSent = 0;
      let totalReceived = 0;
      const all = [...inEvents, ...outEvents]
        .sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0))
        .slice(0, period === '24h' ? 50 : 300); // mais eventos para períodos maiores

      // Agrupar eventos conforme o período
      const now = new Date();
      let activityMap: { [key: string]: number } = {};
      let labels: string[] = [];
      if (period === '24h') {
        // 24h: por hora (horário de Brasília)
        for (let i = 0; i < 24; i++) {
          const d = new Date(now);
          d.setHours(now.getHours() - (23 - i), 0, 0, 0);
          const brDate = new Date(d.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
          const key = brDate.toISOString().slice(0, 13); // yyyy-mm-ddTHH
          activityMap[key] = 0;
        }
      } else {
        // 7d ou 30d: por dia (horário de Brasília)
        const days = period === '7d' ? 7 : 30;
        for (let i = 0; i < days; i++) {
          const d = new Date(now);
          d.setDate(now.getDate() - (days - 1 - i));
          d.setHours(0, 0, 0, 0);
          const brDate = new Date(d.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
          const key = brDate.toISOString().slice(0, 10); // yyyy-mm-dd
          activityMap[key] = 0;
        }
      }

      // Obter provider corretamente (ethers v6)
      const provider = (contract.runner && 'provider' in contract.runner) ? (contract.runner.provider as any) : (contract.provider as any);
      for (const event of all) {
        const args = (event as any).args;
        const blockNumber = (event as any).blockNumber;
        const block = await provider.getBlock(blockNumber);
        // Converter timestamp do bloco para horário de Brasília
        const brDate = new Date(new Date(block.timestamp * 1000).toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
        let key = '';
        if (period === '24h') {
          key = brDate.toISOString().slice(0, 13); // yyyy-mm-ddTHH
        } else {
          key = brDate.toISOString().slice(0, 10); // yyyy-mm-dd
        }
        const value = Number(ethers.formatUnits(args[2], 18));
        if (activityMap[key] !== undefined) {
          activityMap[key] += value;
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
      setActivity(Object.entries(activityMap).map(([date, value]) => ({ date, value })));
      console.log("activity", Object.entries(activityMap));
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
    intervalRef.current = setInterval(fetchStats, 300000); // 5 minutos (reduzido para evitar rate limits)
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

  // Garantir que maxValue nunca seja zero para evitar divisão por zero
  const maxValue = Math.max(...activity.map(a => a.value), 1);
  const maxBarHeight = 100; // px

  // Preparar dados para o Nivo (sanitizando datas)
  const nivoData = activity
    .map(item => {
      let label = '';
      if (period === '24h') {
        const d = new Date(item.date + ':00:00Z');
        label = isNaN(d.getTime())
          ? 'Inválido'
          : d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }) + 'h';
      } else {
        const d = new Date(item.date);
        label = isNaN(d.getTime())
          ? 'Inválido'
          : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }
      return {
        data: item.value,
        label,
      };
    })
    .filter(item => item.label !== 'Inválido');

  // Tema Nivo para dark/light mode
  const nivoTheme = {
    textColor: '#fff',
    axis: {
      domain: { line: { stroke: '#888', strokeWidth: 1 } },
      legend: { text: { fill: '#aaa' } },
      ticks: {
        line: { stroke: '#888', strokeWidth: 1 },
        text: { fill: '#aaa' }
      }
    },
    grid: { line: { stroke: '#444', strokeWidth: 1 } }
  };

  if (!address) {
    return <div className="text-center text-gray-500">Conecte sua carteira para ver o dashboard.</div>;
  }
  if (!contract) {
    return <div className="text-center text-red-500">Contrato não carregado.</div>;
  }

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl shadow-lg">
      {/* Forçar Tailwind a incluir todas as variantes de gradiente */}
      <div className="hidden
        bg-gradient-to-t from-blue-500 to-blue-300
        dark:from-blue-600 dark:to-blue-400
        bg-gradient-to-tl from-blue-500 to-blue-300
        bg-gradient-to-tr from-blue-500 to-blue-300
      " />
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <div className="flex items-center gap-3 mb-6">
        <Image src="/ercdToken.png" alt="ECRD" width={32} height={32} />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h2>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">Período:</span>
          <select
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
            value={period}
            onChange={e => setPeriod(e.target.value as '24h' | '7d' | '30d')}
          >
            {PERIOD_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
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
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Atividade {period === '24h' ? 'nas últimas 24h' : period === '7d' ? 'nos últimos 7 dias' : 'no último mês'}
          </div>
          <span className="text-xs text-gray-500">
            {period === '24h' ? '24h' : period === '7d' ? '7 dias' : '1 mês'}
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ height: 300, minWidth: period === '24h' ? 700 : undefined }}>
            <ResponsiveBar
              data={nivoData}
              keys={['data']}
              indexBy="label"
              margin={{ top: 20, right: 30, bottom: 40, left: 50 }}
              padding={0.3}
              colors={() => barColor}
              theme={nivoTheme}
              axisBottom={{
                tickRotation: period === '30d' ? 45 : period === '24h' ? 45 : 0,
                tickValues: period === '24h'
                  ? nivoData.filter((_, i) => i % 3 === 0 || i === nivoData.length - 1).map(d => d.label)
                  : period === '30d'
                    ? nivoData.filter((_, i) => i % 5 === 0 || i === nivoData.length - 1).map(d => d.label)
                    : undefined
              }}
              axisLeft={{
                legend: 'ECRD',
                legendPosition: 'middle',
                legendOffset: -40
              }}
              tooltip={({ indexValue, value }: { indexValue: string | number, value: number }) => (
                <div style={{ padding: 8, background: '#222', color: '#fff', borderRadius: 4 }}>
                  <strong>{indexValue}</strong><br />
                  {value} ECRD
                </div>
              )}
              enableLabel={false}
              animate={true}
              enableGridY={true}
              borderRadius={2}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          {period === '24h' ? (
            <>
              <span>{activity[0] ? new Date(activity[0].date + ':00:00Z').toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }) + 'h' : ""}</span>
              <span>{activity[activity.length - 1] ? new Date(activity[activity.length - 1].date + ':00:00Z').toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }) + 'h' : ""}</span>
            </>
          ) : (
            <>
              <span>{activity[0] ? new Date(activity[0].date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' }) : ""}</span>
              <span>{activity[activity.length - 1] ? new Date(activity[activity.length - 1].date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' }) : ""}</span>
            </>
          )}
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