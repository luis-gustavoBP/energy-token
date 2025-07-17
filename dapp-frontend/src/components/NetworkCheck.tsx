"use client";
import { useState, useEffect } from "react";
import { getNetworkName, isSupportedNetwork } from "../utils/errors";

interface NetworkCheckProps {
  onNetworkChange?: (chainId: number) => void;
}

export default function NetworkCheck({ onNetworkChange }: NetworkCheckProps) {
  const [, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [networkName, setNetworkName] = useState("");

  useEffect(() => {
    const checkNetwork = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const chainId = await (window as any).ethereum.request({ method: "eth_chainId" });
          const chainIdNumber = parseInt(chainId, 16);
          setChainId(chainIdNumber);
          setNetworkName(getNetworkName(chainIdNumber));
          setIsCorrectNetwork(isSupportedNetwork(chainIdNumber));
          if (onNetworkChange) onNetworkChange(chainIdNumber);
        } catch (error) {
          console.error("Erro ao verificar rede:", error);
        }
      }
    };

    checkNetwork();

    // Listener para mudanças de rede
    if ((window as any).ethereum) {
      (window as any).ethereum.on("chainChanged", (newChainId: string) => {
        const chainIdNumber = parseInt(newChainId, 16);
        setChainId(chainIdNumber);
        setNetworkName(getNetworkName(chainIdNumber));
        setIsCorrectNetwork(isSupportedNetwork(chainIdNumber));
        if (onNetworkChange) onNetworkChange(chainIdNumber);
      });
    }

    return () => {
      if ((window as any).ethereum) {
        (window as any).ethereum.removeAllListeners("chainChanged");
      }
    };
  }, [onNetworkChange]);

  const switchToSepolia = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }], // Sepolia chainId
        });
      } catch (error: any) {
        if (error.code === 4902) {
          // Rede não adicionada, adicionar
          try {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0xaa36a7",
                chainName: "Sepolia Testnet",
                nativeCurrency: {
                  name: "Sepolia Ether",
                  symbol: "SEP",
                  decimals: 18,
                },
                rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/"],
                blockExplorerUrls: ["https://sepolia.etherscan.io/"],
              }],
            });
          } catch (addError) {
            console.error("Erro ao adicionar rede Sepolia:", addError);
          }
        }
      }
    }
  };

  if (!isCorrectNetwork && !networkName) return null;

  return (
    <div className="w-full">
      {!isCorrectNetwork && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                Rede não suportada
              </h3>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Conectado à: {networkName}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Recomendamos usar Sepolia Testnet para testes.
              </p>
            </div>
            <button
              onClick={switchToSepolia}
              className="ml-4 px-3 py-1 text-xs bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            >
              Mudar para Sepolia
            </button>
          </div>
        </div>
      )}
      
      {isCorrectNetwork && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 mb-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-green-700 dark:text-green-300">
              Conectado à {networkName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 