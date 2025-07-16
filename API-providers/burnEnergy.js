require('dotenv').config();
const { ethers } = require("ethers");

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const CONTRACT_ABI = require("../build/contracts/EnergyCredits.json").abi;
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

async function burnEnergy(userAddress, amount) {
    const value = ethers.parseUnits(amount, 18);
    const tx = await contract.burnEnergy(userAddress, value);
    console.log("Transação enviada! Hash:", tx.hash);
    await tx.wait();
    console.log("Energia queimada com sucesso!");
}

// Exemplo de uso:
burnEnergy("0xENDERECO_USUARIO", "1.0"); // 1 ECRD
