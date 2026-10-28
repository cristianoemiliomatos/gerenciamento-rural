# Arquitetura proposta

## Princípios

O AgroGest é um aplicativo Android *local-first*: uma única base SQLite no dispositivo é a fonte de verdade. Não haverá API, contas remotas, sincronização ou valores de estoque guardados apenas na interface. A camada de apresentação nunca altera quantidade diretamente; ela solicita uma operação de domínio ao repositório SQLite.

Cada módulo terá telas em `app/`, regras e casos de uso em `features/<modulo>/`, e acesso a dados em `database/repositories/`. Componentes compartilhados ficam em `components/`. Essa separação deixa a interface simples sem esconder regras críticas de estoque em callbacks de tela.

## Estrutura de pastas alvo

```text
app/                         # Expo Router: rotas e layouts
components/                  # componentes visuais acessíveis
constants/                   # tema e constantes compartilhadas
database/
  migrations/                # scripts versionados e schema_migrations
  repositories/              # operações SQLite e transações
  database.ts                # abertura/configuração da conexão
features/
  stock/                     # produtos, lotes e movimentações
  applications/              # aplicações e itens de aplicação
  farms/                     # propriedades, talhões e culturas
  reports/                   # consultas, filtros e CSV
  security/                  # PIN e bloqueio local
services/                    # foto, arquivo, exportação e backup
types/                       # tipos do domínio
test/                        # setup, fábricas e helpers de teste
```

## Modelo de dados planejado

Todas as chaves primárias serão UUID em texto. Todas as tabelas terão `created_at`; tabelas alteráveis terão `updated_at`; entidades que não podem ser removidas sem perder histórico usarão `is_active` ou `status`.

| Tabela | Responsabilidade e relações principais |
| --- | --- |
| `product_categories` | Categorias configuráveis; `name` único, `is_active`. |
| `products` | Insumo, categoria, unidade, estoque mínimo e status; FK para `product_categories`. |
| `product_images` | Caminho local da foto e ordem; FK para `products`. |
| `suppliers` | Fornecedor/fabricante cadastrado e ativo. |
| `lots` | Produto, fornecedor/fabricante, validade, tipo de validade, quantidade atual e custo médio; FK para `products` e opcional para `suppliers`. |
| `stock_movements` | Livro-razão imutável: entrada, saída, perda, aplicação ou estorno; FKs para produto, lote e movimento estornado quando houver. |
| `farms` | Propriedades rurais. |
| `fields` | Talhões e área em hectares; FK para `farms`. |
| `crops` | Culturas e período/safra opcional. |
| `applications` | Cabeçalho da aplicação; FKs para propriedade, talhão e cultura. |
| `application_items` | Produtos/lotes e custos consumidos; FKs para `applications`, `products` e `lots`. |
| `stock_alert_settings` | Prazo de vencimento, período sem movimentação e preferências dos alertas locais. |
| `user_settings` | Preferências locais, incluindo o estado do tutorial; nunca o PIN em texto. |
| `schema_migrations` | Versão, nome e data de cada migração concluída. |

`lots.expiration_kind` distinguirá explicitamente `known`, `unknown` e `not_applicable`, para não confundir uma validade não informada com um produto que não vence. Índices serão criados nas chaves estrangeiras e nas consultas operacionais: `lots(product_id, expiration_date)`, `stock_movements(product_id, occurred_at)`, `stock_movements(lot_id, occurred_at)`, `application_items(application_id)` e `applications(application_date, field_id, crop_id)`.

## Integridade de estoque e custos

Entradas, saídas, perdas, aplicações e estornos serão operações SQLite atômicas. Antes de uma baixa, o repositório verificará o saldo do lote; saldo negativo causará `ROLLBACK`. Toda mudança de quantidade criará uma linha em `stock_movements`; movimentos confirmados não serão apagados.

Para consumo automático, os lotes válidos serão ordenados por validade conhecida ascendente, depois por data de cadastro: FEFO. Lotes vencidos serão excluídos de novas aplicações. Uma aplicação e todos os respectivos itens e movimentos serão gravados na mesma transação.

O custo médio ponderado será recalculado somente nas entradas: `(quantidade anterior × custo médio anterior + quantidade entrada × custo unitário entrada) / nova quantidade`. Saídas, perdas, aplicações e estornos usarão o custo vigente gravado no movimento, sem recalcular o custo ou contabilizar a mesma baixa duas vezes.

## Migrações e backup

Na abertura do aplicativo, a conexão habilitará chaves estrangeiras e executará migrações pendentes, uma por transação, registrando cada sucesso em `schema_migrations`. A Fase 5 exportará a base SQLite (ou JSON versionado) para arquivo escolhido pelo usuário e validará a versão/esquema antes de restaurar. A restauração só substituirá os dados após confirmação explícita e cópia de segurança prévia.
