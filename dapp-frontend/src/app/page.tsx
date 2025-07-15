"use client";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import WalletConnect from "../components/WalletConnect";
import Balance from "../components/Balance";
import TransferForm from "../components/TransferForm";
import GenerateForm from "../components/GenerateForm";
import GenerationHistory from "../components/GenerationHistory";
import TransactionHistory from "../components/TransactionHistory";
import Image from "next/image";

// ABI e endereço do contrato
import CONTRACT_ABI from "../../build/contracts/EnergyCredits.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [contract, setContract] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState<string>("");

  // Instancia provider de leitura (Infura)
  const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`);

  // Instancia contrato para leitura
  const contractRead = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI.abi, provider);

  // Atualiza contrato de escrita ao conectar carteira
  const handleConnect = useCallback(async (userAddress: string) => {
    setAddress(userAddress);
    if (userAddress && (window as any).ethereum) {
      const web3Provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await web3Provider.getSigner();
      const contractWrite = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI.abi, signer);
      setContract(contractWrite);
      // Descobre owner
      try {
        const owner = await contractWrite.owner();
        setOwnerAddress(owner);
        setIsOwner(owner.toLowerCase() === userAddress.toLowerCase());
      } catch {
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
  }, [CONTRACT_ADDRESS]);

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
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
        <WalletConnect onConnect={handleConnect} />
        {address && contract && <Balance address={address} contract={contract} />}
      </div>
      {address && contract && (
        <>
          <TransferForm contract={contract} address={address} />
          <GenerateForm contract={contract} address={address} isOwner={isOwner} />
          <GenerationHistory contract={contract} isOwner={isOwner} address={address} />
          <TransactionHistory contract={contract} address={address} provider={provider} />
        </>
      )}
      {!address && (
        <div className="text-center text-gray-500 mt-8">Conecte sua carteira para acessar as funcionalidades.</div>
      )}
      <div className="text-xs text-center text-gray-400 mt-8">Contrato: <span className="font-mono">{CONTRACT_ADDRESS}</span><br/>Owner: <span className="font-mono">{ownerAddress}</span></div>
    </div>
  );
}
