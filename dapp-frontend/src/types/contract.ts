import { ethers } from "ethers";

export interface EnergyGeneration {
  user: string;
  amount: bigint;
  timestamp: bigint;
}

export interface ContractABI {
  abi: any[];
  networks?: {
    [networkId: string]: {
      address: string;
    };
  };
}

// Tipo mais simples para o contrato
export type EnergyCreditsContract = ethers.Contract;

export interface ContractProvider {
  contract: EnergyCreditsContract;
  signer?: ethers.Signer;
} 