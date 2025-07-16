"use client";
import { useState, useEffect } from "react";

export default function WalletConnect({ onConnect }: { onConnect?: (address: string) => void }) {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [disconnected, setDisconnected] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum && (window as any).ethereum.selectedAddress) {
      setAddress((window as any).ethereum.selectedAddress);
      if (onConnect) onConnect((window as any).ethereum.selectedAddress);
    }
  }, [onConnect]);

  const connectWallet = async () => {
    setError("");
    setDisconnected(false);
    if (!(window as any).ethereum) {
      setError("MetaMask não encontrada. Instale a extensão no seu navegador.");
      return;
    }
    try {
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);
      if (onConnect) onConnect(accounts[0]);
    } catch (err: any) {
      setError("Erro ao conectar: " + (err.message || err));
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setDisconnected(true);
    if (onConnect) onConnect("");
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {address ? (
        <>
          <div className="text-xs text-gray-500">Carteira conectada:</div>
          <div className="font-mono text-sm break-all bg-gray-100 dark:bg-gray-900 rounded-xl px-3 py-1 mb-2">{address}</div>
          <button onClick={disconnectWallet} className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:opacity-80 transition">Desconectar</button>
        </>
      ) : (
        <button onClick={connectWallet} className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:opacity-80 transition">Conectar MetaMask</button>
      )}
      {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      {disconnected && (
        <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 text-center max-w-xs">
          Atenção: Para desconectar totalmente, remova este site das conexões autorizadas nas configurações do MetaMask.
        </div>
      )}
    </div>
  );
} 