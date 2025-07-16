"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function Balance({ address, contract }: { address: string; contract: any }) {
  const [balance, setBalance] = useState<string>("-");

  useEffect(() => {
    if (!address || !contract) return;
    let ignore = false;
    async function fetchBalance() {
      try {
        const bal = await contract.balanceOf(address);
        if (!ignore) setBalance(ethers.formatUnits(bal, 18));
      } catch {
        if (!ignore) setBalance("-");
      }
    }
    fetchBalance();
    return () => { ignore = true; };
  }, [address, contract]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <Image src="/ercdToken.png" alt="ECRD" width={48} height={48} />
        Saldo de ECRD
      </div>
      <div className="font-mono text-2xl bg-gray-100 dark:bg-gray-900 rounded-xl px-4 py-2 mt-1">{balance}</div>
    </div>
  );
} 