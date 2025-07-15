// API-providers/generateEnergy.js
require('dotenv').config();
const { ethers } = require("ethers");

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const CONTRACT_ABI = require("../build/contracts/EnergyCredits.json").abi;
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

async function generateEnergy(userAddress, amount) {
    const tx = await contract.generateEnergy(userAddress, amount);
    console.log("Transação enviada! Hash:", tx.hash);
    await tx.wait();
    console.log("Energia gerada com sucesso!");
}

// Exemplo de uso:
const amount = ethers.parseUnits("1.0", 18); // 1 ECRD
generateEnergy(process.env.ADDRESS_TESTE, amount);
