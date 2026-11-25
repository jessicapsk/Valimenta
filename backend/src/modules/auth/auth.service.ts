import bcrypt from 'bcrypt';
import { ConflictError } from '../../shared/domain/errors.js';
import type { IAccountRepository } from './account.repository.js';
import type { PublicAccountDTO, RegisterInputDTO } from './auth.schema.js';

const BCRYPT_SALT_ROUNDS = 10;

export class AuthService {
  private readonly accountRepository: IAccountRepository;

  constructor(accountRepository: IAccountRepository) {
    this.accountRepository = accountRepository;
  }

  /**
   * US01 — Criar conta (RN17, RN18, RN19, RNF01, RNF06):
   * Valida unicidade do e-mail normalizado, aplica hash bcrypt na senha
   * e retorna apenas os dados públicos da conta (sem senhaHash).
   */
  public async register(input: RegisterInputDTO): Promise<PublicAccountDTO> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existingAccount = await this.accountRepository.findByEmail(normalizedEmail);
    if (existingAccount) {
      throw new ConflictError('Este e-mail já está em uso.', 'EMAIL_ALREADY_IN_USE');
    }

    const senhaHash = await bcrypt.hash(input.senha, BCRYPT_SALT_ROUNDS);

    const createdAccount = await this.accountRepository.create({
      email: normalizedEmail,
      senhaHash,
    });

    return {
      id: createdAccount.id,
      email: createdAccount.email,
    };
  }
}
