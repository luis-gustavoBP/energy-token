"use client";
import { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { EnergyCreditsContract } from "../types/contract";
import { parseTransactionError } from "../utils/errors";
import LoadingSpinner from "./LoadingSpinner";
import { useNotifications } from "./NotificationSystem";

interface SmartTransferFormProps {
  contract: EnergyCreditsContract;
  address: string;
  balance: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export default function SmartTransferForm({ contract, address, balance }: SmartTransferFormProps) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recentAddresses, setRecentAddresses] = useState<string[]>([]);
  const { addNotification } = useNotifications();

  // Validação em tempo real
  const validation = useMemo((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validação de endereço
    if (to && !ethers.isAddress(to)) {
      errors.push("Endereço inválido");
    } else if (to && to.toLowerCase() === address.toLowerCase()) {
      errors.push("Não é possível transferir para o próprio endereço");
    }

    // Validação de valor
    if (amount) {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        errors.push("Valor deve ser maior que zero");
      } else {
        const balanceNum = parseFloat(balance);
        if (amountNum > balanceNum) {
          errors.push("Saldo insuficiente");
        } else if (amountNum > balanceNum * 0.9) {
          warnings.push("Transferindo mais de 90% do saldo");
        }
      }
    }

    // Validações adicionais
    if (to && amount && parseFloat(amount) > 1000) {
      warnings.push("Valor alto - confirme a transação");
    }

    return {
      isValid: errors.length === 0 && Boolean(to) && Boolean(amount),
      errors,
      warnings
    };
  }, [to, amount, address, balance]);

  // Auto-complete de endereços recentes
  const filteredAddresses = useMemo(() => {
    if (!to) return recentAddresses;
    return recentAddresses.filter(addr => 
      addr.toLowerCase().includes(to.toLowerCase())
    );
  }, [to, recentAddresses]);

  // Preview da transação
  const transactionPreview = useMemo(() => {
    if (!validation.isValid) return null;

    const amountNum = parseFloat(amount);
    const estimatedGas = "~50,000"; // Estimativa básica
    const estimatedFee = "~0.001 ETH"; // Estimativa básica

    return {
      from: address,
      to,
      amount: amountNum,
      estimatedGas,
      estimatedFee,
      remainingBalance: parseFloat(balance) - amountNum
    };
  }, [validation.isValid, address, to, amount, balance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) return;

    setLoading(true);
    try {
      const value = ethers.parseUnits(amount, 18);
      
      addNotification({
        type: "info",
        title: "Transação Enviada",
        message: "Aguardando confirmação da rede...",
        duration: 0
      });

      const tx = await contract.transfer(to, value);
      
      // Adicionar endereço aos recentes
      setRecentAddresses(prev => {
        const newList = [to, ...prev.filter(addr => addr !== to)].slice(0, 5);
        return newList;
      });

      await tx.wait();
      
      addNotification({
        type: "success",
        title: "Transferência Concluída",
        message: `${amount} ECRD enviados para ${to.slice(0, 6)}...${to.slice(-4)}`,
        duration: 5000
      });

      setTo("");
      setAmount("");
      setShowPreview(false);
    } catch (err: unknown) {
      const parsedError = parseTransactionError(err);
      addNotification({
        type: "error",
        title: "Erro na Transferência",
        message: parsedError.userMessage,
        duration: 8000
      });
    }
    setLoading(false);
  };

  const handleQuickAmount = (percentage: number) => {
    const balanceNum = parseFloat(balance);
    const quickAmount = (balanceNum * percentage / 100).toFixed(2);
    setAmount(quickAmount);
  };

  return (
    <div className="w-full bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
          💸
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Transferência Inteligente</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de Endereço com Auto-complete */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Endereço de Destino
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border transition-colors ${
              validation.errors.some(e => e.includes("Endereço")) 
                ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            }`}
            required
          />
          
          {/* Auto-complete dropdown */}
          {filteredAddresses.length > 0 && to && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
              {filteredAddresses.map((addr, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setTo(addr)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-mono"
                >
                  {addr}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Campo de Valor com Quick Amounts */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quantidade ECRD
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border transition-colors ${
              validation.errors.some(e => e.includes("Valor") || e.includes("Saldo")) 
                ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            }`}
            min="0"
            step="0.01"
            required
          />
          
          {/* Quick Amount Buttons */}
          <div className="flex gap-2 mt-2">
            {[25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                type="button"
                onClick={() => handleQuickAmount(percentage)}
                className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
              >
                {percentage}%
              </button>
            ))}
          </div>
        </div>

        {/* Validação e Warnings */}
        {validation.errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            {validation.errors.map((error, index) => (
              <div key={index} className="text-red-700 dark:text-red-300 text-sm">
                • {error}
              </div>
            ))}
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            {validation.warnings.map((warning, index) => (
              <div key={index} className="text-yellow-700 dark:text-yellow-300 text-sm">
                ⚠ {warning}
              </div>
            ))}
          </div>
        )}

        {/* Preview da Transação */}
        {transactionPreview && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
              Preview da Transação
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">De:</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {transactionPreview.from.slice(0, 6)}...{transactionPreview.from.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Para:</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {transactionPreview.to.slice(0, 6)}...{transactionPreview.to.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Valor:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {transactionPreview.amount} ECRD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Saldo Restante:</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {transactionPreview.remainingBalance.toFixed(2)} ECRD
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Gas Estimado:</span>
                <span>{transactionPreview.estimatedGas}</span>
              </div>
            </div>
          </div>
        )}

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={!validation.isValid || loading}
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <LoadingSpinner size="sm" text="Enviando..." />
          ) : (
            "Transferir ECRD"
          )}
        </button>
      </form>

      {/* Endereços Recentes */}
      {recentAddresses.length > 0 && (
        <div className="mt-6">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Endereços Recentes
          </div>
          <div className="flex flex-wrap gap-2">
            {recentAddresses.map((addr, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setTo(addr)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-mono"
              >
                {addr.slice(0, 6)}...{addr.slice(-4)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 