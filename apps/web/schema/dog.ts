import { z } from "zod"

export const dogSizeSchema = z.enum(["SMALL", "MEDIUM", "LARGE"])

export const dogSchema = z.object({
  dog_id: z.number().int(),
  name: z.string(),
  size: dogSizeSchema,
  age: z.number().int().nullable(),
  image_url: z.string().nullable(),
})

export const dogCreateRequestSchema = z.object({
  name: z.string().min(1),
  size: dogSizeSchema,
  age: z.number().int(),
  image_url: z.string().nullable().optional(),
})

export const dogUpdateRequestSchema = dogCreateRequestSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one profile field is required",
  })

export const signupCompleteResponseSchema = z.object({
  access_token: z.string(),
  dog: dogSchema,
})

export const presignedUploadRequestSchema = z.object({
  file_extension: z.string().min(1).max(10),
})

export const presignedUploadResponseSchema = z.object({
  upload_url: z.string().url(),
  image_url: z.string().url(),
})

export type Dog = z.output<typeof dogSchema>
export type DogSize = z.output<typeof dogSizeSchema>
export type DogCreateRequest = z.input<typeof dogCreateRequestSchema>
export type DogUpdateRequest = z.input<typeof dogUpdateRequestSchema>
export type SignupCompleteResponse = z.output<
  typeof signupCompleteResponseSchema
>
export type PresignedUploadRequest = z.input<typeof presignedUploadRequestSchema>
