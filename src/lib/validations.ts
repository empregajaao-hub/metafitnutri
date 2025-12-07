import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  email: z.string()
    .trim()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const signupSchema = z.object({
  email: z.string()
    .trim()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Za-z]/, 'Senha deve conter pelo menos uma letra')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  fullName: z.string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  phoneNumber: z.string()
    .trim()
    .min(9, 'Número de telefone inválido')
    .max(20, 'Número de telefone inválido')
    .regex(/^\+?[0-9\s-]{9,20}$/, 'Formato de telefone inválido'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

// Payment file validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

export const validateReceiptFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'Por favor, carrega o comprovativo de pagamento.' };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Ficheiro muito grande. Máximo permitido: 10MB.' };
  }
  
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Tipo de ficheiro inválido. Aceito: JPG, PNG ou PDF.' };
  }
  
  return { valid: true };
};

// Helper to format validation errors
export const formatZodError = (error: z.ZodError): string => {
  const firstError = error.errors[0];
  return firstError?.message || 'Erro de validação';
};
