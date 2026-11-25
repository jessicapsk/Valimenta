export interface PublicAccountDTO {
  id: string;
  email: string;
}

export interface AuthAccountResponse {
  conta: PublicAccountDTO;
}

export interface RegisterAccountInput {
  email: string;
  senha: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

const API_BASE_URL = 'http://localhost:3333';

export async function registerAccount(
  input: RegisterAccountInput,
  fetchImpl: typeof fetch = fetch,
): Promise<AuthAccountResponse> {
  const response = await fetchImpl(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as {
    conta?: PublicAccountDTO;
    message?: string;
    code?: string;
  };

  if (!response.ok || !data.conta) {
    throw new ApiError(
      data.message ?? 'Não foi possível concluir o cadastro.',
      response.status,
      data.code ?? 'API_ERROR',
    );
  }

  return { conta: data.conta };
}
