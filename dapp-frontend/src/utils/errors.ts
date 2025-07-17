export interface TransactionError {
  code: string;
  message: string;
  userMessage: string;
}

export function parseTransactionError(error: any): TransactionError {
  const errorMessage = error?.message || error?.reason || error?.toString() || "Erro desconhecido";
  
  console.log("parseTransactionError: Erro original:", error);
  console.log("parseTransactionError: Mensagem:", errorMessage);
  
  // Erros específicos do contrato
  if (errorMessage.includes("onlyOwner") || errorMessage.includes("Ownable")) {
    return {
      code: "ONLY_OWNER",
      message: errorMessage,
      userMessage: "Apenas o owner do contrato pode executar esta ação."
    };
  }
  
  if (errorMessage.includes("Saldo insuficiente") || errorMessage.includes("insufficient balance")) {
    return {
      code: "INSUFFICIENT_BALANCE",
      message: errorMessage,
      userMessage: "Saldo insuficiente para executar esta operação."
    };
  }
  
  if (errorMessage.includes("Endereco invalido") || errorMessage.includes("invalid address")) {
    return {
      code: "INVALID_ADDRESS",
      message: errorMessage,
      userMessage: "Endereço inválido fornecido."
    };
  }
  
  if (errorMessage.includes("quantidade deve ser maior que zero") || errorMessage.includes("amount must be greater than zero")) {
    return {
      code: "INVALID_AMOUNT",
      message: errorMessage,
      userMessage: "A quantidade deve ser maior que zero."
    };
  }
  
  // Erros comuns do MetaMask
  if (errorMessage.includes("insufficient funds")) {
    return {
      code: "INSUFFICIENT_FUNDS",
      message: errorMessage,
      userMessage: "Saldo insuficiente para pagar a taxa de transação (gas)."
    };
  }
  
  if (errorMessage.includes("user rejected") || errorMessage.includes("User denied")) {
    return {
      code: "USER_REJECTED",
      message: errorMessage,
      userMessage: "Transação cancelada pelo usuário."
    };
  }
  
  if (errorMessage.includes("network") || errorMessage.includes("connection")) {
    return {
      code: "NETWORK_ERROR",
      message: errorMessage,
      userMessage: "Erro de rede. Verifique sua conexão."
    };
  }
  
  if (errorMessage.includes("nonce")) {
    return {
      code: "NONCE_ERROR",
      message: errorMessage,
      userMessage: "Erro de sequência de transação. Tente novamente."
    };
  }
  
  if (errorMessage.includes("gas") || errorMessage.includes("out of gas")) {
    return {
      code: "GAS_ERROR",
      message: errorMessage,
      userMessage: "Erro com taxa de transação. Tente novamente."
    };
  }
  
  if (errorMessage.includes("execution reverted") || errorMessage.includes("revert")) {
    return {
      code: "CONTRACT_ERROR",
      message: errorMessage,
      userMessage: "Erro no contrato. Verifique os parâmetros e permissões."
    };
  }
  
  if (errorMessage.includes("function") && errorMessage.includes("not found")) {
    return {
      code: "FUNCTION_NOT_FOUND",
      message: errorMessage,
      userMessage: "Função não encontrada no contrato. Verifique o ABI."
    };
  }
  
  // Erro padrão
  return {
    code: "UNKNOWN_ERROR",
    message: errorMessage,
    userMessage: "Ocorreu um erro inesperado. Tente novamente."
  };
}

export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 1: return "Ethereum Mainnet";
    case 11155111: return "Sepolia Testnet";
    case 137: return "Polygon";
    case 56: return "BSC";
    default: return `Rede ${chainId}`;
  }
}

export function isSupportedNetwork(chainId: number): boolean {
  return [1, 11155111, 137, 56].includes(chainId);
} 