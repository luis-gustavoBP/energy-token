"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { EnergyCreditsContract } from "../types/contract";
import { parseTransactionError } from "../utils/errors";
import LoadingSpinner from "./LoadingSpinner";

export default function GenerateForm({ contract, isOwner }: { contract: EnergyCreditsContract; address: string; isOwner: boolean }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOwner) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!ethers.isAddress(to)) {
      setError("Endereço de destino inválido.");
      return;
    }
    let value;
    try {
      value = ethers.parseUnits(amount, 18);
      if (value <= BigInt(0)) {
        setError("A quantidade deve ser maior que zero.");
        return;
      }
    } catch {
      setError("Valor inválido.");
      return;
    }
    setLoading(true);
    try {
      const tx = await contract.generateEnergy(to, value);
      setSuccess("Transação enviada! Aguardando confirmação...");
      await tx.wait();
      setSuccess("Energia gerada com sucesso!");
      setTo(""); setAmount("");
    } catch (err: unknown) {
      const parsedError = parseTransactionError(err);
      setError(parsedError.userMessage);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl shadow">
      <div className="font-semibold mb-2">Gerar ECRD (Owner)</div>
      <input type="text" placeholder="Endereço do usuário" value={to} onChange={e => setTo(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black" required />
      <input type="number" placeholder="Quantidade" value={amount} onChange={e => setAmount(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black" required min="0" step="any" />
      <button type="submit" disabled={loading} className="mt-2 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:opacity-80 transition disabled:opacity-50">
        {loading ? <LoadingSpinner size="sm" text="Gerando..." /> : "Gerar"}
      </button>
      {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      {success && <div className="text-green-600 text-xs mt-2">{success}</div>}
    </form>
  );
} 