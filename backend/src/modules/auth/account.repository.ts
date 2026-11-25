import type { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../shared/database/prisma.js';

export interface AccountRecord {
  id: string;
  email: string;
  senhaHash: string;
  criadoEm: Date;
}

export interface CreateAccountData {
  email: string;
  senhaHash: string;
}

export interface IAccountRepository {
  findByEmail(email: string): Promise<AccountRecord | null>;
  findById(id: string): Promise<AccountRecord | null>;
  create(data: CreateAccountData): Promise<AccountRecord>;
}

export class PrismaAccountRepository implements IAccountRepository {
  private readonly db: PrismaClient;

  constructor(db: PrismaClient = defaultPrisma) {
    this.db = db;
  }

  public async findByEmail(email: string): Promise<AccountRecord | null> {
    return this.db.conta.findUnique({
      where: { email },
    });
  }

  public async findById(id: string): Promise<AccountRecord | null> {
    return this.db.conta.findUnique({
      where: { id },
    });
  }

  public async create(data: CreateAccountData): Promise<AccountRecord> {
    return this.db.conta.create({
      data: {
        email: data.email,
        senhaHash: data.senhaHash,
      },
    });
  }
}
