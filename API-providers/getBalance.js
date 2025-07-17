require('dotenv').config();
const { ethers } = require("ethers");

const ALCHEMY_PROJECT_ID = process.env.ALCHEMY_PROJECT_ID;
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_PROJECT_ID}`);

// Endereço do contrato EnergyCredits (substitua pelo endereço real)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = require("../build/contracts/EnergyCredits.json").abi;

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

async function getTokenBalance(address) {
    const balance = await contract.balanceOf(address);
    console.log(`Saldo de ECRD de ${address}:`, ethers.formatUnits(balance, 18), "ECRD");
}

// Exemplo de uso:
getTokenBalance(process.env.ADDRESS_TESTE);
getTokenBalance(process.env.ADDRESS_ALLOWED);