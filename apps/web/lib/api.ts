import ky from "ky"
import { z } from "zod"

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8080"),
})

const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
})

export const api = ky.create({
  baseUrl: clientEnv.NEXT_PUBLIC_API_URL,
  retry: 1,
  timeout: 10_000,
})
