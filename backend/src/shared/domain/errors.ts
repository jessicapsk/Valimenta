export abstract class DomainError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  protected constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message: string, code = 'BUSINESS_RULE_VIOLATION', statusCode = 422) {
    super(message, code, statusCode);
  }
}

export class ValidationDomainError extends DomainError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message, code, 400);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Não autenticado.', code = 'UNAUTHORIZED') {
    super(message, code, 401);
  }
}

export class ResourceNotFoundError extends DomainError {
  constructor(message = 'Recurso não encontrado.', code = 'RESOURCE_NOT_FOUND') {
    super(message, code, 404);
  }
}

export class MethodNotAllowedError extends DomainError {
  constructor(
    message = 'O histórico de movimentações é imutável e somente para leitura.',
    code = 'METHOD_NOT_ALLOWED',
  ) {
    super(message, code, 405);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, code = 'RESOURCE_CONFLICT') {
    super(message, code, 409);
  }
}
