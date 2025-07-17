require('dotenv').config();
const { ethers } = require("ethers");

// Usando variável de ambiente para segurança
const ALCHEMY_PROJECT_ID = process.env.ALCHEMY_PROJECT_ID;

// Sepolia (ou outra rede suportada)
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_PROJECT_ID}`);

async function main() {
    const blockNumber = await provider.getBlockNumber();
    console.log("Último bloco:", blockNumber);
}

main();
module.exports = provider;