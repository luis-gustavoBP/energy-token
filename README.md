# EnergyCredits DApp

Uma aplicação descentralizada (DApp) moderna para gerenciamento de créditos de energia usando blockchain Ethereum. O projeto permite gerar, transferir e rastrear tokens ERC20 representando créditos de energia renovável.

## 🚀 Funcionalidades

- **Conexão de Carteira**: Integração com MetaMask para conexão segura
- **Gerenciamento de Saldo**: Visualização em tempo real do saldo de tokens ECRD
- **Transferência de Tokens**: Envio de créditos de energia para outros endereços
- **Geração de Energia**: Interface para owner gerar novos créditos de energia
- **Histórico Completo**: Rastreamento de geração de energia e transações
- **Design Responsivo**: Interface moderna e adaptável para diferentes dispositivos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática para maior confiabilidade
- **Tailwind CSS** - Framework CSS utilitário para design moderno
- **ethers.js v6** - Biblioteca para interação com Ethereum
- **Google Fonts (Inter)** - Tipografia moderna e legível

### Smart Contract
- **Solidity 0.8.0+** - Linguagem para contratos inteligentes
- **OpenZeppelin** - Biblioteca de contratos seguros e testados
- **ERC20** - Padrão para tokens fungíveis
- **Ownable** - Controle de acesso baseado em ownership

### Infraestrutura
- **Infura** - Provider para rede Sepolia
- **MetaMask** - Carteira Ethereum para usuários
- **Truffle** - Framework de desenvolvimento e deploy

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- MetaMask instalado no navegador
- Conta no Infura (gratuita)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/energycredits.git
cd energycredits
```

### 2. Instale as dependências
```bash
# Dependências do smart contract
npm install

# Dependências do frontend
cd dapp-frontend
npm install
```

### 3. Configure as variáveis de ambiente

#### Smart Contract (`.env` na raiz)
```env
INFURA_PROJECT_ID=seu_project_id_do_infura
PRIVATE_KEY=sua_chave_privada
MNEMONIC=sua_seed_phrase
```

#### Frontend (`dapp-frontend/.env.local`)
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xendereco_do_contrato_implantado
NEXT_PUBLIC_INFURA_PROJECT_ID=seu_project_id_do_infura
```

### 4. Compile e implante o smart contract
```bash
# Na raiz do projeto
npx truffle compile
npx truffle migrate --network sepolia
```

### 5. Execute o frontend
```bash
cd dapp-frontend
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para usar a aplicação.

## 🎯 Como Usar

### Conectando a Carteira
1. Clique em "Conectar MetaMask"
2. Autorize a conexão no MetaMask
3. Seu endereço e saldo aparecerão automaticamente

### Transferindo Tokens
1. Conecte sua carteira
2. Preencha o endereço de destino
3. Digite a quantidade de ECRD
4. Clique em "Transferir"
5. Confirme a transação no MetaMask

### Gerando Energia (Apenas Owner)
1. Conecte a carteira do owner
2. Preencha o endereço do usuário
3. Digite a quantidade de energia
4. Clique em "Gerar"
5. Confirme a transação

### Visualizando Históricos
- **Histórico de Geração**: Mostra todas as gerações de energia
- **Histórico de Transações**: Exibe entradas e saídas de tokens

## 📁 Estrutura do Projeto

```
energycredits/
├── contracts/
│   └── energycredits.sol          # Smart contract principal
├── migrations/
│   └── deploy-energy.js           # Script de deploy
├── test/
│   ├── energy.js                  # Teste de implantação
│   └── energy-testContract.js     # Testes do contrato
├── API-providers/
│   ├── index.js                   # Provider de conexão
│   ├── getBalance.js              # Consulta de saldo
│   ├── sendTransaction.js         # Transferência de tokens
│   ├── generateEnergy.js          # Geração de energia
│   └── deployContract.js          # Deploy do contrato
├── dapp-frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Layout global
│   │   │   └── page.tsx           # Página principal
│   │   └── components/
│   │       ├── WalletConnect.tsx  # Conexão de carteira
│   │       ├── Balance.tsx        # Exibição de saldo
│   │       ├── TransferForm.tsx   # Formulário de transferência
│   │       ├── GenerateForm.tsx   # Geração de energia
│   │       ├── GenerationHistory.tsx # Histórico de geração
│   │       └── TransactionHistory.tsx # Histórico de transações
│   ├── public/
│   │   ├── ercd.png               # Imagem principal
│   │   └── ercdToken.png          # Ícone do token
│   └── package.json
└── README.md
```

## 🔧 Scripts Disponíveis

### Smart Contract
```bash
npx truffle compile          # Compilar contratos
npx truffle migrate          # Implantar na rede local
npx truffle migrate --network sepolia  # Implantar na Sepolia
npx truffle test             # Executar testes
```

### Frontend
```bash
npm run dev                  # Servidor de desenvolvimento
npm run build               # Build de produção
npm run start               # Servidor de produção
npm run lint                # Verificar código
```

## 🌐 Redes Suportadas

- **Sepolia** (Testnet) - Recomendado para testes
- **Local** (Ganache) - Desenvolvimento local
- **Mainnet** - Produção (requer configuração adicional)

## 🔒 Segurança

- Chaves privadas nunca são expostas no frontend
- Validação de entrada em todos os formulários
- Uso de bibliotecas OpenZeppelin testadas
- Conexão segura via MetaMask

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique se todas as dependências estão instaladas
2. Confirme se as variáveis de ambiente estão configuradas
3. Verifique se o MetaMask está conectado à rede correta
4. Abra uma issue no GitHub com detalhes do problema

## 🚀 Roadmap

- [ ] Suporte a múltiplas redes
- [ ] Dashboard com gráficos de uso
- [ ] Integração com oráculos de preço
- [ ] Sistema de recompensas
- [ ] Mobile app
- [ ] Integração com APIs de energia renovável

---

**Desenvolvendo o futuro da energia descentralizada** 
