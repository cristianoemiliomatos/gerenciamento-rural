# AgroGest

Aplicativo Android local para controle simples de insumos agrícolas. Este repositório está sendo desenvolvido por fases para um projeto de faculdade.

## Pré-requisitos

- Node.js LTS
- Android Studio com um emulador Android, ou Expo Go em um aparelho Android

## Instalação e execução

```bash
npm install
npx expo install --fix
npm run android
```

Para iniciar o servidor e escolher o destino manualmente:

```bash
npm start
```

## Verificações

```bash
npm run typecheck
npm run lint
npm test
```

## Escopo atual — Fase 1

- Expo Router com barra inferior: Início, Estoque, Aplicações, Relatórios e Mais.
- Tema com contraste e componentes reutilizáveis.
- Estados vazios funcionais que explicam os próximos passos.
- Configuração inicial de Jest e React Native Testing Library.

As operações de estoque, SQLite, PIN, fotos, backup e relatórios com dados reais pertencem às fases seguintes. Nenhum indicador exibido na Fase 1 representa dado de estoque real.

## Arquitetura prevista

- `app/`: rotas e composição de telas.
- `components/`: elementos visuais reutilizáveis e acessíveis.
- `features/`: módulos por domínio (estoque, aplicações, propriedades, relatórios e segurança).
- `database/`: conexão SQLite, migrações e repositórios transacionais (Fase 2).
- `services/`: recursos do dispositivo, backup e exportação (fases posteriores).
- `types/`: contratos de domínio compartilhados.
- `test/`: configuração e testes automatizados.

Os dados serão exclusivamente locais em SQLite. Nas fases de estoque, movimentos serão imutáveis e correções serão feitas por estorno; o consumo de lotes seguirá FEFO e toda alteração de saldo ocorrerá em transação.

O detalhamento das entidades, integridade transacional, custos e migrações está em [docs/architecture.md](docs/architecture.md).
