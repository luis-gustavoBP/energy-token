// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EnergyCredits is ERC20, Ownable {
    // Estrutura para armazenar informações de geração de energia
    struct EnergyGeneration {
        address user;
        uint256 amount;
        uint256 timestamp;
    }

    // Mapeamento para armazenar as gerações de energia
    mapping(uint256 => EnergyGeneration) public energyGenerations;
    uint256 public generationCount;

    // Evento para registrar a geração de energia
    event EnergyGenerated(address indexed user, uint256 amount, uint256 timestamp);

    // Construtor do contrato
    constructor() ERC20("EnergyCredits", "ECRD") Ownable(msg.sender) {
        // O proprietário do contrato será o criador do contrato
    }

    // Função para registrar a geração de energia
function generateEnergy(address user, uint256 amount) external onlyOwner {
    require(user != address(0), "Endereco invalido");
        require(amount > 0, "A quantidade deve ser maior que zero");
        // Registrar a geração de energia
    energyGenerations[generationCount] = EnergyGeneration(user, amount, block.timestamp);
    emit EnergyGenerated(user, amount, block.timestamp);
        // Emitir tokens equivalentes à quantidade de energia gerada
    _mint(user, amount);
        generationCount++;
    }

    // Função para transferir créditos de energia entre usuários
    function transferCredits(address to, uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Saldo insuficiente");
        _transfer(msg.sender, to, amount);
    }

    // Função para visualizar o histórico de geração de energia
    function getEnergyGeneration(uint256 index) external view returns (address, uint256, uint256) {
        EnergyGeneration memory generation = energyGenerations[index];
        return (generation.user, generation.amount, generation.timestamp);
    }
}