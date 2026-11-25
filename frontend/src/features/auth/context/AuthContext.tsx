import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  fetchCurrentAccount,
  type AuthAccountResponse,
  type PublicAccountDTO,
} from '../api/auth.api.ts';

export interface AuthContextValue {
  conta: PublicAccountDTO | null;
  isLoading: boolean;
  setAuthenticatedAccount: (conta: PublicAccountDTO) => void;
  clearAuthenticatedAccount: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
  initialAccount?: PublicAccountDTO | null;
  skipInitialCheck?: boolean;
  checkSessionFn?: () => Promise<AuthAccountResponse>;
}

/**
 * AuthProvider (US02 / RN17 / RNF06):
 * Mantém o estado da conta autenticada exclusivamente em memória e via cookie HttpOnly
 * validado pelo endpoint GET /api/auth/me (jamais armazena tokens em localStorage/sessionStorage).
 */
export function AuthProvider({
  children,
  initialAccount = null,
  skipInitialCheck = false,
  checkSessionFn = fetchCurrentAccount,
}: AuthProviderProps) {
  const [conta, setConta] = useState<PublicAccountDTO | null>(initialAccount);
  const [isLoading, setIsLoading] = useState<boolean>(!skipInitialCheck && initialAccount === null);

  useEffect(() => {
    if (skipInitialCheck || initialAccount !== null) {
      return;
    }

    let isMounted = true;
    checkSessionFn()
      .then((res) => {
        if (isMounted) {
          setConta(res.conta);
        }
      })
      .catch(() => {
        if (isMounted) {
          setConta(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [skipInitialCheck, initialAccount, checkSessionFn]);

  function setAuthenticatedAccount(nextConta: PublicAccountDTO) {
    setConta(nextConta);
  }

  function clearAuthenticatedAccount() {
    setConta(null);
  }

  return (
    <AuthContext.Provider
      value={{
        conta,
        isLoading,
        setAuthenticatedAccount,
        clearAuthenticatedAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      conta: null,
      isLoading: false,
      setAuthenticatedAccount: () => undefined,
      clearAuthenticatedAccount: () => undefined,
    };
  }
  return context;
}
