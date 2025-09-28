"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  PlusCircle, 
  MinusCircle, 
  History, 
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { ethers } from "ethers";

export default function TokenManager() {
  const { account, contract } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Form states
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [mintTo, setMintTo] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransfer = async () => {
    if (!contract || !transferTo || !transferAmount) {
      alert("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      const amount = ethers.parseEther(transferAmount);
      const tx = await contract.transfer(transferTo, amount);
      await tx.wait();
      alert("Transferência processada com sucesso");
      setTransferTo("");
      setTransferAmount("");
    } catch (error: any) {
      console.error("Transfer error:", error);
      alert("Erro na transferência: " + (error.message || "Falha ao processar transferência"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async () => {
    if (!contract || !mintTo || !mintAmount) {
      alert("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      const amount = ethers.parseEther(mintAmount);
      const tx = await contract.generateEnergy(mintTo, amount);
      await tx.wait();
      alert(`${mintAmount} ECRD criados com sucesso`);
      setMintTo("");
      setMintAmount("");
    } catch (error: any) {
      console.error("Mint error:", error);
      alert("Erro ao criar tokens: " + (error.message || "Falha ao criar tokens"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBurn = async () => {
    if (!contract || !burnAmount) {
      alert("Informe a quantidade para queimar");
      return;
    }

    setIsLoading(true);
    try {
      const amount = ethers.parseEther(burnAmount);
      const tx = await contract.burnEnergy(account!, amount);
      await tx.wait();
      alert(`${burnAmount} ECRD removidos da circulação`);
      setBurnAmount("");
    } catch (error: any) {
      console.error("Burn error:", error);
      alert("Erro ao queimar tokens: " + (error.message || "Falha ao queimar tokens"));
    } finally {
      setIsLoading(false);
    }
  };

  // Mock transaction history
  const mockTransactions = [
    {
      type: "transfer",
      from: account,
      to: "0x742d35Cc6634C0532925a3b8D67846442E69deD2",
      amount: "50.0",
      hash: "0xabcd1234...",
      timestamp: "2024-01-15 14:30:25"
    },
    {
      type: "mint",
      from: "0x0000000000000000000000000000000000000000",
      to: account,
      amount: "100.0",
      hash: "0xefgh5678...",
      timestamp: "2024-01-15 10:15:10"
    },
    {
      type: "transfer",
      from: "0x123abc456def789...",
      to: account,
      amount: "25.5",
      hash: "0xijkl9012...",
      timestamp: "2024-01-14 16:45:00"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Tokens</h2>
        <p className="text-gray-600">
          Transfira, crie ou queime créditos de energia
        </p>
      </div>

      <Tabs defaultValue="transfer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="transfer" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Send className="w-4 h-4 mr-2" />
            Transferir
          </TabsTrigger>
          <TabsTrigger value="mint" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <PlusCircle className="w-4 h-4 mr-2" />
            Criar
          </TabsTrigger>
          <TabsTrigger value="burn" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <MinusCircle className="w-4 h-4 mr-2" />
            Queimar
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <History className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Transfer Tab */}
        <TabsContent value="transfer">
          <Card className="bg-white shadow-lg border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-green-600" />
                Transferir Tokens ECRD
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-to">Endereço de destino</Label>
                <div className="relative">
                  <Input
                    id="transfer-to"
                    placeholder="0x..."
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="pr-10 border-gray-300"
                  />
                  <Button
                    className="absolute right-1 top-1 h-8 w-8 p-0 bg-transparent hover:bg-gray-100"
                    onClick={() => copyToClipboard(account || "")}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Quantidade (ECRD)</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="border-gray-300"
                />
              </div>

              <Button
                onClick={handleTransfer}
                disabled={isLoading || !transferTo || !transferAmount}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Transferir Tokens
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mint Tab */}
        <TabsContent value="mint">
          <Card className="bg-white shadow-lg border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-green-600" />
                Criar Novos Tokens
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  Admin Only
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mint-to">Endereço de destino</Label>
                <Input
                  id="mint-to"
                  placeholder="0x..."
                  value={mintTo}
                  onChange={(e) => setMintTo(e.target.value)}
                  className="border-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mint-amount">Quantidade (ECRD)</Label>
                <Input
                  id="mint-amount"
                  type="number"
                  placeholder="0.00"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className="border-gray-300"
                />
              </div>

              <Button
                onClick={handleMint}
                disabled={isLoading || !mintTo || !mintAmount}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Criar Tokens
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Burn Tab */}
        <TabsContent value="burn">
          <Card className="bg-white shadow-lg border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MinusCircle className="w-5 h-5 text-red-600" />
                Queimar Tokens
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  Irreversível
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="burn-amount">Quantidade (ECRD)</Label>
                <Input
                  id="burn-amount"
                  type="number"
                  placeholder="0.00"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  className="border-gray-300"
                />
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  ⚠️ Esta ação é irreversível. Os tokens serão permanentemente removidos da circulação.
                </p>
              </div>

              <Button
                onClick={handleBurn}
                disabled={isLoading || !burnAmount}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Queimando...
                  </>
                ) : (
                  <>
                    <MinusCircle className="w-4 h-4 mr-2" />
                    Queimar Tokens
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card className="bg-white shadow-lg border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-green-600" />
                Histórico de Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === 'mint' ? 'bg-green-100 text-green-600' :
                        tx.type === 'burn' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {tx.type === 'mint' ? <PlusCircle className="w-4 h-4" /> :
                         tx.type === 'burn' ? <MinusCircle className="w-4 h-4" /> :
                         <Send className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {tx.type === 'mint' ? 'Tokens Criados' :
                           tx.type === 'burn' ? 'Tokens Queimados' :
                           'Transferência'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {tx.type !== 'burn' ? `De ${tx.from?.slice(0, 6)}...${tx.from?.slice(-4)} para ${tx.to?.slice(0, 6)}...${tx.to?.slice(-4)}` : 
                           `${tx.amount} ECRD removidos da circulação`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{tx.amount} ECRD</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-600">{tx.timestamp}</p>
                        <Button className="h-6 w-6 p-0 bg-transparent hover:bg-gray-100">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 