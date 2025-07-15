// Importar bibliotecas
require('dotenv').config(); // Importa as variáveis do .env
const { ethers } = require("ethers");

// Configurações
const providerUrl = `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`; // URL Infura completa
const privateKey = process.env.PRIVATE_KEY; // Chave privada da sua conta MetaMask

const contractABI = require('../build/contracts/EnergyCredits.json').abi;

// Conectar-se ao provedor (ethers v6)
const provider = new ethers.JsonRpcProvider(providerUrl);

// Criar uma carteira com a chave privada
const wallet = new ethers.Wallet(privateKey, provider);

// Função para implantar o contrato
async function deployContract() {
    try {
        // Obter o bytecode do contrato compilado
        const contractArtifact = require('../build/contracts/EnergyCredits.json');
        const bytecode = contractArtifact.bytecode;

        console.log("Implantando o contrato...");

        // Criar factory e implantar
        const factory = new ethers.ContractFactory(contractABI, bytecode, wallet);
        const contract = await factory.deploy();
        
        console.log("Contrato implantado. Endereço:", await contract.getAddress());

        // Aguardar a confirmação da transação
        await contract.waitForDeployment();
        console.log("Contrato confirmado na rede:", await contract.getAddress());
        
        return contract;
    } catch (error) {
        console.error("Erro ao implantar o contrato:", error);
        throw error;
    }
}

// Função para testar o contrato
async function testContract() {
    try {
        const contract = await deployContract();
        
        // Testar geração de energia (apenas owner pode fazer isso)
        console.log("\nTestando geração de energia...");
        const userAddress = process.env.ADDRESS_TESTE; 
        const amount = 9000000000000;
        const tx = await contract.generateEnergy(userAddress, amount);
        await tx.wait();
        console.log("Energia gerada com sucesso!");
        
        // Verificar saldo
        const balance = await contract.balanceOf(await wallet.getAddress());
        console.log("Saldo atual:", ethers.formatEther(balance), "ECRD");
        
    } catch (error) {
        console.error("Erro nos testes:", error);
    }
}

// Chamar a função de teste
testContract().catch((error) => {
    console.error("Erro geral:", error);
});
