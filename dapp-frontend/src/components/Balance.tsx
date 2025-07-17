"use client";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { EnergyCreditsContract } from "../types/contract";

export default function Balance({ address, contract, onBalanceChange }: { address: string; contract: EnergyCreditsContract; onBalanceChange?: (balance: string) => void }) {
  const [balance, setBalance] = useState<string>("-");
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address || !contract) return;
    setLoading(true);
      try {
        const bal = await contract.balanceOf(address);
      const formattedBalance = ethers.formatUnits(bal, 18);
      setBalance(formattedBalance);
      if (onBalanceChange) onBalanceChange(formattedBalance);
    } catch (error) {
      console.error("Erro ao buscar saldo:", error);
      setBalance("-");
    } finally {
      setLoading(false);
    }
  }, [address, contract]);

  useEffect(() => {
    fetchBalance();
  }, [address, contract, fetchBalance]);

  // Atualizar saldo quando o contrato mudar (após transações)
  useEffect(() => {
    if (!contract) return;
    
    const handleTransfer = () => {
      setTimeout(fetchBalance, 1000); // Aguarda 1s para a transação ser processada
    };

    // Listeners para eventos de transferência
    contract.on("Transfer", handleTransfer);
    
    return () => {
      contract.off("Transfer", handleTransfer);
    };
  }, [contract, address, fetchBalance]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <Image src="/ercdToken.png" alt="ECRD" width={48} height={48} />
        Saldo de ECRD
      </div>
      <div className="font-mono text-2xl bg-gray-100 dark:bg-gray-900 rounded-xl px-4 py-2 mt-1">
        {loading ? "..." : balance}
      </div>
    </div>
  );
} 