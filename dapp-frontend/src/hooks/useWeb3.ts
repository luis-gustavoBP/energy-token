import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { EnergyCreditsContract } from '../types/contract';

// ABI e endereço do contrato
import CONTRACT_ABI from '../../build/contracts/EnergyCredits.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export const useWeb3 = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<string>("0");
  const [contract, setContract] = useState<EnergyCreditsContract | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Instancia provider de leitura (Alchemy)
  const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_PROJECT_ID}`);

  // Instancia contrato para leitura
  const contractRead = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI.abi, provider) as EnergyCreditsContract;

  const connectWallet = useCallback(async () => {
    if (!(window as any).ethereum) {
      throw new Error("MetaMask não encontrada. Instale a extensão no seu navegador.");
    }

    setIsLoading(true);
    try {
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        const userAddress = accounts[0];
        setAccount(userAddress);
        setIsConnected(true);

        // Get chain ID
        const chainId = await (window as any).ethereum.request({ method: "eth_chainId" });
        setChainId(parseInt(chainId, 16));

        // Get ETH balance
        const balance = await provider.getBalance(userAddress);
        setBalance(ethers.formatEther(balance));

        // Setup contract for writing
        const web3Provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await web3Provider.getSigner();
        const contractWrite = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI.abi, signer) as EnergyCreditsContract;
        setContract(contractWrite);

        // Listen for account changes
        (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            disconnectWallet();
          } else {
            setAccount(accounts[0]);
          }
        });

        // Listen for chain changes
        (window as any).ethereum.on('chainChanged', (chainId: string) => {
          setChainId(parseInt(chainId, 16));
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setBalance("0");
    setContract(null);
  }, []);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if ((window as any).ethereum && (window as any).ethereum.selectedAddress) {
        const userAddress = (window as any).ethereum.selectedAddress;
        setAccount(userAddress);
        setIsConnected(true);

        try {
          const chainId = await (window as any).ethereum.request({ method: "eth_chainId" });
          setChainId(parseInt(chainId, 16));

          const balance = await provider.getBalance(userAddress);
          setBalance(ethers.formatEther(balance));

          const web3Provider = new ethers.BrowserProvider((window as any).ethereum);
          const signer = await web3Provider.getSigner();
          const contractWrite = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI.abi, signer) as EnergyCreditsContract;
          setContract(contractWrite);
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    checkConnection();
  }, [provider]);

  return {
    account,
    chainId,
    isConnected,
    balance,
    contract,
    isLoading,
    connectWallet,
    disconnectWallet,
    contractRead
  };
}; 