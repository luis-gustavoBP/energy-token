"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import WalletConnect from "../components/WalletConnect";
import Balance from "../components/Balance";
import SmartTransferForm from "../components/SmartTransferForm";
import GenerateForm from "../components/GenerateForm";
import GenerationHistory from "../components/GenerationHistory";
import TransactionHistory from "../components/TransactionHistory";
import BurnForm from "../components/BurnForm";
import NetworkCheck from "../components/NetworkCheck";
import Dashboard from "../components/Dashboard";
import { NotificationProvider, NotificationHistory } from "../components/NotificationSystem";
import Image from "next/image";
import { EnergyCreditsContract } from "../types/contract";

// ABI e endereço do contrato
import CONTRACT_ABI from "../../build/contracts/EnergyCredits.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// Log para verificar o ABI
console.log("HomeContent: ABI carregado:", CONTRACT_ABI.abi ? "Sim" : "Não");
console.log("HomeContent: burnEnergy no ABI:", CONTRACT_ABI.abi?.some((item: any) => item.name === 'burnEnergy'));

function HomeContent() {
  const [address, setAddress] = useState<string>("");
  const [contract, setContract] = useState<EnergyCreditsContract | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("-");

  // Instancia provider de leitura (Alchemy)
  const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_PROJECT_ID}`);

  // Instancia contrato para leitura usando useMemo para evitar recriação
  const contractRead = useMemo(() => {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI.abi, provider) as EnergyCreditsContract;
  }, [provider]);

  // Atualiza contrato de escrita ao conectar carteira
  const handleConnect = useCallback(async (userAddress: string) => {
    setAddress(userAddress);
    console.log("HomeContent: Conectando carteira:", userAddress);
    
    if (userAddress && (window as any).ethereum) {
      const web3Provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await web3Provider.getSigner();
      const contractWrite = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI.abi, signer) as EnergyCreditsContract;
      setContract(contractWrite);
      
      // Descobre owner
      try {
        console.log("HomeContent: Verificando owner do contrato...");
        const owner = await contractWrite.owner();
        console.log("HomeContent: Owner do contrato:", owner);
        console.log("HomeContent: Endereço do usuário:", userAddress);
        console.log("HomeContent: Comparando endereços...");
        
        const isUserOwner = owner.toLowerCase() === userAddress.toLowerCase();
        console.log("HomeContent: isOwner =", isUserOwner);
        
        setOwnerAddress(owner);
        setIsOwner(isUserOwner);
      } catch (error) {
        console.error("HomeContent: Erro ao verificar owner:", error);
        setIsOwner(false);
      }
    } else {
      setContract(null);
      setIsOwner(false);
    }
  }, []);

  // Atualiza owner para leitura mesmo sem carteira conectada
  useEffect(() => {
    async function fetchOwner() {
      try {
        const owner = await contractRead.owner();
        setOwnerAddress(owner);
      } catch {
        setOwnerAddress("");
      }
    }
    fetchOwner();
  }, [contractRead]);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-center">
        <Image
          src="/ercd.png"
          alt="ERCD Token"
          width={180}
          height={180}
          className="mb-2"
          priority
        />
      </div>
      <h1 className="text-3xl font-bold text-center mb-2">EnergyCredits DApp</h1>
      
      <NetworkCheck />
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
        <div className="flex items-center gap-4">
          {/* <WalletConnect onConnect={handleConnect} /> */}
          {/* <NotificationHistory /> */}
        </div>
        {address && contract && <Balance address={address} contract={contract} onBalanceChange={setBalance} />}
      </div>
      
      {address && contract && (
        <>
          <Dashboard contract={contract} address={address} balance={balance} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SmartTransferForm contract={contract} address={address} balance={balance} />
            <div className="space-y-6">
          <GenerateForm contract={contract} address={address} isOwner={isOwner} />
          {isOwner && <BurnForm contract={contract} address={address} isOwner={isOwner} />}
            </div>
          </div>
          <GenerationHistory contract={contract} isOwner={isOwner} address={address} />
          <TransactionHistory contract={contract} address={address} provider={provider} />
        </>
      )}
      {!address && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <WalletConnect onConnect={handleConnect} />
              <NotificationHistory />
            </div>
            <div className="text-center text-gray-500 mt-4">Conecte sua carteira para acessar as funcionalidades.</div>
          </div>
        </div>
      )}
      <div className="text-xs text-center text-gray-400 mt-8">Contrato: <span className="font-mono">{CONTRACT_ADDRESS}</span><br/>Owner: <span className="font-mono">{ownerAddress}</span></div>
    </div>
  );
}

export default function Home() {
  return (
    <NotificationProvider>
      <HomeContent />
    </NotificationProvider>
  );
}
