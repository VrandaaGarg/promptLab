import { z } from 'zod'

const email = z.email('Enter a valid email address')

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
})

export const signUpSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80, 'Name is too long'),
  email,
  password: z.string().min(8, 'Use at least 8 characters').max(128, 'Password is too long'),
})

/** Search params accepted by /login and /signup. */
export const authSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
})
