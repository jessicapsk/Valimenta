import bcrypt from 'bcrypt';
import { ConflictError, UnauthorizedError } from '../../shared/domain/errors.js';
import type { IAccountRepository } from './account.repository.js';
import type { LoginInputDTO, PublicAccountDTO, RegisterInputDTO } from './auth.schema.js';

const BCRYPT_SALT_ROUNDS = 10;
const DUMMY_BCRYPT_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8p4r1xH9iK/X.C6O2eS7y2q9L0R5yG';

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

  /**
   * US02 — Fazer login (RN17, RNF06):
   * Autentica e-mail e senha contra o hash bcrypt, retornando erro neutro
   * ("E-mail ou senha incorretos.") sem revelar se o e-mail existe no banco.
   */
  public async login(input: LoginInputDTO): Promise<PublicAccountDTO> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const account = await this.accountRepository.findByEmail(normalizedEmail);

    if (!account) {
      await bcrypt.compare(input.senha, DUMMY_BCRYPT_HASH);
      throw new UnauthorizedError('E-mail ou senha incorretos.', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(input.senha, account.senhaHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('E-mail ou senha incorretos.', 'INVALID_CREDENTIALS');
    }

    return {
      id: account.id,
      email: account.email,
    };
  }

  /**
   * US02 — Consulta da conta autenticada na sessão ativa (RN17, RNF06).
   */
  public async getProfile(contaId: string): Promise<PublicAccountDTO> {
    const account = await this.accountRepository.findById(contaId);
    if (!account) {
      throw new UnauthorizedError('Não autenticado.');
    }

    return {
      id: account.id,
      email: account.email,
    };
  }
}
