/**
 * The browser preview uses the in-memory demo repository. Keeping this
 * platform file free of expo-sqlite prevents Metro from bundling its WASM
 * worker for the web target.
 */
export function getDatabase(): never {
  throw new Error('O banco SQLite está disponível apenas no Android.');
}

export function resetDatabaseConnection(): void {
  // No persistent browser database is used in demo mode.
}
