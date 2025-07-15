// API-providers/deployContract.js
require('dotenv').config();
const { ethers } = require("ethers");

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const CONTRACT_ABI = require("../build/contracts/EnergyCredits.json").abi;
const CONTRACT_BYTECODE = require("../build/contracts/EnergyCredits.json").bytecode;

async function deploy() {
    const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, wallet);
    console.log("Implantando o contrato...");
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    console.log("Contrato implantado em:", address);
    // Dica: copie esse endereço para o .env!
}

deploy();
