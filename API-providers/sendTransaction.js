require('dotenv').config();
const { ethers } = require("ethers");

const ALCHEMY_PROJECT_ID = process.env.ALCHEMY_PROJECT_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_PROJECT_ID}`);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const CONTRACT_ABI = require("../build/contracts/EnergyCredits.json").abi;
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

async function sendECRD(to, amount) {
    // amount deve ser em unidades inteiras do token (ex: 1 ECRD = 1e18)
    const tx = await contract.transfer(to, amount);
    console.log("Transação enviada! Hash:", tx.hash);
    await tx.wait();
    console.log("Transferência de ECRD confirmada!");
}

// Exemplo de uso:
const to = process.env.ADDRESS_ALLOWED; // endereço de destino
const amount = ethers.parseUnits("1.0", 18); // 1 ECRD (ajuste o valor conforme necessário)
sendECRD(to, amount);
