require('dotenv').config();
const { ethers } = require("ethers");

// Usando variável de ambiente para segurança
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

// Sepolia (ou outra rede suportada)
const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`);

async function main() {
    const blockNumber = await provider.getBlockNumber();
    console.log("Último bloco:", blockNumber);
}

main();
module.exports = provider;