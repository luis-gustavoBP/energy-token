const { ethers } = require("ethers");
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_PROJECT_ID}`);
const ownerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // PRIVATE_KEY do owner

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = require("../build/contracts/EnergyCredits.json").abi;

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, ownerWallet);

async function gerarEnergiaParaUsuario(userAddress, amount) {
    const tx = await contract.generateEnergy(userAddress, amount);
    console.log("Transação enviada! Hash:", tx.hash);
    await tx.wait();
    console.log("Energia gerada com sucesso!");
}

// Exemplo de uso:
gerarEnergiaParaUsuario(process.env.ADDRESS_TESTE, 1000);
