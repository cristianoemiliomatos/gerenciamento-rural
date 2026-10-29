import type { SQLiteDatabase } from 'expo-sqlite';

type Migration = {
  version: number;
  name: string;
  sql: string;
};

const migrations: Migration[] = [
  {
    version: 1,
    name: 'create_stock_foundation',
    sql: `
      CREATE TABLE IF NOT EXISTS product_categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL UNIQUE,
        is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL UNIQUE,
        is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL COLLATE NOCASE,
        category_id TEXT REFERENCES product_categories(id),
        description TEXT,
        manufacturer TEXT,
        supplier TEXT,
        unit TEXT NOT NULL,
        minimum_stock REAL NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
        current_stock REAL NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
        average_cost REAL NOT NULL DEFAULT 0 CHECK (average_cost >= 0),
        notes TEXT,
        is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS products_name_unique ON products(name);

      CREATE TABLE IF NOT EXISTS product_images (
        id TEXT PRIMARY KEY NOT NULL,
        product_id TEXT NOT NULL REFERENCES products(id),
        uri TEXT NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS lots (
        id TEXT PRIMARY KEY NOT NULL,
        product_id TEXT NOT NULL REFERENCES products(id),
        code TEXT,
        manufacturer TEXT,
        supplier TEXT,
        expiration_kind TEXT NOT NULL CHECK (expiration_kind IN ('known', 'unknown', 'not_applicable')),
        expiration_date TEXT,
        current_quantity REAL NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
        average_cost REAL NOT NULL DEFAULT 0 CHECK (average_cost >= 0),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        CHECK (expiration_kind <> 'known' OR expiration_date IS NOT NULL)
      );

      CREATE INDEX IF NOT EXISTS lots_product_expiration_idx ON lots(product_id, expiration_date);

      CREATE TABLE IF NOT EXISTS stock_movements (
        id TEXT PRIMARY KEY NOT NULL,
        product_id TEXT NOT NULL REFERENCES products(id),
        lot_id TEXT REFERENCES lots(id),
        movement_type TEXT NOT NULL CHECK (movement_type IN ('entry', 'exit', 'loss', 'reversal')),
        quantity REAL NOT NULL CHECK (quantity > 0),
        quantity_delta REAL NOT NULL CHECK (quantity_delta <> 0),
        unit TEXT NOT NULL,
        occurred_at TEXT NOT NULL,
        origin TEXT NOT NULL,
        notes TEXT,
        unit_cost REAL NOT NULL CHECK (unit_cost >= 0),
        total_cost REAL NOT NULL CHECK (total_cost >= 0),
        reversal_of_movement_id TEXT REFERENCES stock_movements(id),
        is_reversed INTEGER NOT NULL DEFAULT 0 CHECK (is_reversed IN (0, 1)),
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS movements_product_occurred_idx ON stock_movements(product_id, occurred_at DESC);
      CREATE INDEX IF NOT EXISTS movements_lot_occurred_idx ON stock_movements(lot_id, occurred_at DESC);

      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );

      INSERT OR IGNORE INTO product_categories (id, name, created_at) VALUES
        ('00000000-0000-4000-8000-000000000001', 'Defensivo agrícola', CURRENT_TIMESTAMP),
        ('00000000-0000-4000-8000-000000000002', 'Fertilizante', CURRENT_TIMESTAMP),
        ('00000000-0000-4000-8000-000000000003', 'Semente', CURRENT_TIMESTAMP),
        ('00000000-0000-4000-8000-000000000004', 'Produto biológico', CURRENT_TIMESTAMP),
        ('00000000-0000-4000-8000-000000000005', 'Outro', CURRENT_TIMESTAMP);
    `,
  },
  {
    version: 2,
    name: 'create_plots_and_expenses',
    sql: `
      CREATE TABLE IF NOT EXISTS plots (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL COLLATE NOCASE,
        area_hectares REAL NOT NULL CHECK (area_hectares > 0),
        crop TEXT,
        notes TEXT,
        is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS plots_name_unique ON plots(name);

      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL CHECK (amount > 0),
        expense_date TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('Insumos', 'Combustível', 'Manutenção', 'Mão de obra', 'Outros')),
        plot_id TEXT NOT NULL REFERENCES plots(id),
        product_id TEXT REFERENCES products(id),
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS expenses_plot_date_idx ON expenses(plot_id, expense_date DESC);
      CREATE INDEX IF NOT EXISTS expenses_product_date_idx ON expenses(product_id, expense_date DESC);
      CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(expense_date DESC);
    `,
  },
];

export async function runMigrations(database: SQLiteDatabase): Promise<void> {
  await database.execAsync('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, applied_at TEXT NOT NULL);');
  const applied = await database.getAllAsync<{ version: number }>('SELECT version FROM schema_migrations');
  const appliedVersions = new Set(applied.map(({ version }) => version));

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) continue;

    await database.withExclusiveTransactionAsync(async (transaction) => {
      await transaction.execAsync(migration.sql);
      await transaction.runAsync(
        'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)',
        migration.version,
        migration.name,
        new Date().toISOString(),
      );
    });
  }
}
