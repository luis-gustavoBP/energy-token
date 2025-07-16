export interface TransactionError {
  code: string;
  message: string;
  userMessage: string;
}

export function parseTransactionError(error: any): TransactionError {
  const errorMessage = error?.message || error?.reason || error?.toString() || "Erro desconhecido";
  
  // Erros comuns do MetaMask
  if (errorMessage.includes("insufficient funds")) {
    return {
      code: "INSUFFICIENT_FUNDS",
      message: errorMessage,
      userMessage: "Saldo insuficiente para pagar a taxa de transação (gas)."
    };
  }
  
  if (errorMessage.includes("user rejected")) {
    return {
      code: "USER_REJECTED",
      message: errorMessage,
      userMessage: "Transação cancelada pelo usuário."
    };
  }
  
  if (errorMessage.includes("network")) {
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
  
  if (errorMessage.includes("gas")) {
    return {
      code: "GAS_ERROR",
      message: errorMessage,
      userMessage: "Erro com taxa de transação. Tente novamente."
    };
  }
  
  if (errorMessage.includes("execution reverted")) {
    return {
      code: "CONTRACT_ERROR",
      message: errorMessage,
      userMessage: "Erro no contrato. Verifique os parâmetros."
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