import { z } from "zod"

export const walkLogSchema = z.object({
  log_id: z.number().int(),
  dog_id: z.number().int(),
  course_id: z.number().int().nullable(),
  started_at: z.string().datetime({ offset: true }),
  ended_at: z.string().datetime({ offset: true }).nullable(),
  diary: z.string().nullable(),
})

export const walkLogsSchema = z.array(walkLogSchema)

export const walkLogUpdateSchema = z.object({
  diary: z.string().nullable(),
})

export type WalkLog = z.output<typeof walkLogSchema>
export type WalkLogUpdate = z.input<typeof walkLogUpdateSchema>
