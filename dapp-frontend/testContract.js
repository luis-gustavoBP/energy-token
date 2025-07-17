require('dotenv').config();
const { ethers } = require("ethers");

// Usar as mesmas variáveis do frontend
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const ALCHEMY_PROJECT_ID = process.env.NEXT_PUBLIC_ALCHEMY_PROJECT_ID;

// ABI básico para testar
const basicABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function owner() view returns (address)",
  "function balanceOf(address) view returns (uint256)"
];

async function testContract() {
  try {
    console.log("=== Teste de Conexão com Contrato ===");
    console.log("Endereço:", CONTRACT_ADDRESS);
    console.log("Alchemy ID:", ALCHEMY_PROJECT_ID);
    
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_PROJECT_ID}`);
    console.log("Provider criado com sucesso");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, basicABI, provider);
    console.log("Contrato instanciado com sucesso");
    
    // Testar funções básicas
    const name = await contract.name();
    console.log("Nome:", name);
    
    const symbol = await contract.symbol();
    console.log("Símbolo:", symbol);
    
    const owner = await contract.owner();
    console.log("Owner:", owner);
    
    console.log("✅ Todos os testes passaram!");
    
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
    console.error("Stack:", error.stack);
  }
}

testContract(); 