require('dotenv').config();
const { ethers } = require("ethers");
const provider = require("./index");

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = require("../build/contracts/EnergyCredits.json").abi;

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

async function getTokenBalance(address) {
    const balance = await contract.balanceOf(address);
    console.log(`Saldo de tokens de ${address}:`, ethers.formatUnits(balance, 18), "ECRD");
}

// Exemplo de uso:
getTokenBalance(process.env.ADDRESS_TESTE);
