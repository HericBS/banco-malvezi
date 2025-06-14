# Banco Malvezi

Sistema bancário completo desenvolvido em Node.js com Express, Sequelize e MySQL. Este projeto foi criado como parte de um trabalho acadêmico, com foco em segurança, autenticação e organização em camadas.

## 🧾 Descrição

O projeto simula um sistema bancário com as seguintes funcionalidades:

- Criação de contas
- Depósitos e saques
- Transferências entre contas
- Autenticação via JWT e criptografia com bcrypt
- Integração com banco de dados MySQL via Sequelize
- Estrutura modularizada (controllers, models, DAO)

## 👥 Autores

- Heric Barros De Sousa
- Lucas Galvão
- Gabriel

## 🧰 Tecnologias utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [Sequelize](https://sequelize.org/)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [CORS](https://www.npmjs.com/package/cors)

## 🚀 Como executar o projeto

### Pré-requisitos

- Node.js (versão 18+ recomendada)
- MySQL

### Passos

1. Clone o repositório:

```bash
git git@github.com:HericBS/banco-malvezi.git
cd banco-malvezi
```

2. Instale as dependências:

```bash
npm install
```

3. Configure o banco de dados no arquivo `.env` (caso exista) ou diretamente no código-fonte (por padrão, Sequelize configurações devem estar em `config/config.json` ou similar).

4. Inicie o servidor:

```bash
npm start
```

## 🗂 Estrutura do Projeto

```
banco-malvezi/
├── app.js          # Arquivo principal da aplicação
├── index.js        # Configuração inicial do servidor
├── package.json    # Dependências e scripts do projeto
├── /models         # Definições das tabelas do banco de dados
├── /controllers    # Lógica de controle das rotas
├── /dao            # Acesso direto ao banco de dados
├── /routes         # Definição das rotas da aplicação
└── /utils          # Funções utilitárias
```

## 🐛 Reportar Problemas

Se encontrar algum problema, reporte em:  
[Issues no GitHub](https://github.com/HericBS/banco-malvezi.git)

## 📄 Licença

Projeto licenciado sob [ISC License](https://opensource.org/licenses/ISC).