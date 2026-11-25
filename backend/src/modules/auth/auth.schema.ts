import { z } from 'zod';

export const registerBodySchema = z.object({
  email: z
    .string({ required_error: 'Informe um endereço de e-mail válido.' })
    .trim()
    .toLowerCase()
    .email('Informe um endereço de e-mail válido.'),
  senha: z
    .string({ required_error: 'A senha deve conter no mínimo 8 caracteres.' })
    .min(8, 'A senha deve conter no mínimo 8 caracteres.'),
});

export type RegisterInputDTO = z.infer<typeof registerBodySchema>;

export const loginBodySchema = z.object({
  email: z
    .string({ required_error: 'Informe um endereço de e-mail válido.' })
    .trim()
    .toLowerCase()
    .email('Informe um endereço de e-mail válido.'),
  senha: z.string({ required_error: 'A senha é obrigatória.' }).min(1, 'A senha é obrigatória.'),
});

export type LoginInputDTO = z.infer<typeof loginBodySchema>;

export const publicAccountSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
});

export type PublicAccountDTO = z.infer<typeof publicAccountSchema>;

export const authAccountResponseSchema = z.object({
  conta: publicAccountSchema,
});

export const logoutResponseSchema = z.object({
  message: z.string(),
});
