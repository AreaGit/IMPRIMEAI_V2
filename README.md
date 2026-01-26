# IMPRIMEAI

## 📌 Visão Geral

A **IMPRIMEAI** é uma plataforma de **gráfica rápida com atuação nacional**, operando por meio de **gráficas parceiras (franquias)**.  
O sistema padroniza o atendimento, produção, pagamentos e logística através de módulos integrados de **vendas, impressão, financeiro e operações técnicas**.

A plataforma conecta **clientes**, **gráficas** e **administradores**, garantindo escalabilidade, rastreabilidade de pedidos e uma experiência consistente em 
todo o território nacional.

---

## 🧠 Autoria e Histórico do Projeto

A plataforma **IMPRIMEAI** foi **arquitetada e desenvolvida originalmente por Gabriel**, responsável pela concepção técnica, definição da arquitetura,
modelagem de dados e implementação das principais regras de negócio do sistema.

O projeto encontra-se em evolução contínua e pode receber manutenções, melhorias e novas funcionalidades por outros desenvolvedores da equipe,
respeitando a arquitetura e os padrões definidos no desenvolvimento inicial.

---

## 👥 Perfis de Usuários

### 👑 Administrador
- Acesso total ao sistema
- Gerenciamento de usuários e permissões
- Cadastro e edição de produtos
- Gerenciamento de gráficas
- Relatórios financeiros e operacionais
- Saque do valor total dos pedidos entregues

### 🧑‍💻 Cliente
- Navegação e pesquisa de produtos
- Adição de produtos ao carrinho
- Upload de arquivos de personalização
- Finalização de compras
- Acompanhamento do status dos pedidos
- Recebimento de notificações por WhatsApp e e-mail

### 🏭 Gráfica (Franquia)
- Visualização de pedidos próximos à sua localização
- Download de arquivos de produção
- Atualização de status dos pedidos
- Preenchimento de formulário de entrega
- Saque e antecipação de valores de pedidos entregues

---

## ⚙️ Funcionalidades

### 🔐 Autenticação e Usuários
- Cadastro de usuários
- Login por e-mail e senha
- Logout seguro
- Cadastro exclusivo de clientes empresariais
- Login específico para empresas

### 🛍️ Produtos e Carrinho
- Pesquisa de produtos por nome
- Navegação por categorias
- Adição e remoção de itens no carrinho
- Edição de produtos pelo administrador

### 📦 Pedidos
- Finalização de pedidos com upload de arquivos
- Visualização de detalhes do pedido
- Filtro de pedidos por status:
  - Recebido
  - Em produção
  - Finalizado/Enviado para Transporte
  - Entregue
- Protocolo de entrega com evidências

### 📍 Entrega
- Endereço único
- Retirada na loja
- Múltiplos endereços via upload de planilha (CSV / Excel)
- Validação automática dos dados da planilha

### 💳 Pagamentos
- Cartão de Crédito
- Boleto
- Pix
- Carteira digital do usuário

### 💰 Financeiro
- Recarga de saldo na carteira do usuário
- Saque do saldo da gráfica
- Antecipação de saque com taxa de 3,5%
- Saque administrativo do valor total dos pedidos entregues

### 📢 Notificações
- Envio automático de notificações via:
  - WhatsApp
  - E-mail
- Atualizações sobre status de todo o processo do pedido

### 🗺️ Geolocalização
- Busca inteligente de pedidos próximos à gráfica
- Associação automática entre pedido e gráfica apta a produzir

---

## 🧱 Arquitetura do Sistema

A arquitetura do sistema foi definida no desenvolvimento inicial do projeto, priorizando escalabilidade, modularização e fácil manutenção.

- Backend modularizado em Node.js
- APIs RESTful bem definidas
- Integração com APIs externas (pagamentos, notificações e geolocalização)

---

## 🔐 Segurança

- Comunicação segura via HTTPS (TLS)
- Autenticação e autorização por perfil
- Integração segura com gateways de pagamento

---

## 📱 Usabilidade

- Interface responsiva
- Compatível com desktop, tablets e smartphones
- Navegação intuitiva e padronizada

---

## 🧪 Testes e Qualidade

- Testes funcionais das principais rotas
- Validação contínua das funcionalidades

---

## 🏛️ Governança Técnica

Este projeto segue padrões técnicos e arquiteturais definidos em sua fase inicial de desenvolvimento, com o objetivo de garantir consistência, 
segurança e facilidade de evolução.

Alterações estruturais relevantes devem considerar o impacto na arquitetura existente e na integridade das regras de negócio já consolidadas.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Banco de Dados
- MySQL

### Outras Ferramentas
- Git / GitHub
- APIs de Pagamento
- APIs de Notificação (WhatsApp / E-mail)
- Geolocalização

---

## 🔗 Link para Documentação Técnica
➡️ https://docs.google.com/document/d/1gEKOpnbnXxOprg8_wion-ziGKmEGrsa7LDeBPpJk5FI/edit?usp=sharing

---
