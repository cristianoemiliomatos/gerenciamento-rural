import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { getDatabase, resetDatabaseConnection } from '@/database/database';

type DatabaseContextValue = {
  isReady: boolean;
  error: Error | null;
  retry: () => void;
};

const DatabaseContext = createContext<DatabaseContextValue | undefined>(undefined);

export function DatabaseProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(Platform.OS === 'web');
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;

    if (Platform.OS === 'web') {
      return () => { isMounted = false; };
    }

    getDatabase()
      .then(() => {
        if (isMounted) setIsReady(true);
      })
      .catch((initializationError: unknown) => {
        if (isMounted) {
          setError(initializationError instanceof Error ? initializationError : new Error('Não foi possível abrir o banco local.'));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    resetDatabaseConnection();
    setIsReady(false);
    setError(null);
    setAttempt((value) => value + 1);
  }, []);

  return <DatabaseContext.Provider value={{ isReady, error, retry }}>{children}</DatabaseContext.Provider>;
}

export function useDatabaseStatus(): DatabaseContextValue {
  const context = useContext(DatabaseContext);
  if (!context) throw new Error('useDatabaseStatus deve ser usado dentro de DatabaseProvider.');
  return context;
}
