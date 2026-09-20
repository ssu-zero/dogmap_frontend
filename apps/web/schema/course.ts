import { z } from "zod"

// The backend stores course dates in a timezone-naive DB column and returns
// them as local Korean wall-clock times. Restore the KST offset before the UI
// parses them so a visitor's own timezone cannot shift the schedule.
const backendDateTimeSchema = z.iso
  .datetime({ offset: true, local: true })
  .transform((value) =>
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}+09:00`
  )

export const courseCategorySchema = z.enum(["FOOD", "CAFE", "WALK", "ACTIVITY"])
export const placeCategorySchema = z.enum([
  "PARK",
  "CAFE",
  "RESTAURANT",
  "HOSPITAL",
  "PET_SHOP",
  "ETC",
])

export const categoryTargetSchema = z.object({
  category: courseCategorySchema,
  count: z.number().int().positive(),
})

export const courseCreateRequestSchema = z.object({
  start_lat: z.number().min(-90).max(90),
  start_lng: z.number().min(-180).max(180),
  target_duration_minutes: z.number().int().positive(),
  category_targets: z.array(categoryTargetSchema).min(1),
  title: z.string().nullable().optional(),
  walk_date: z.string().datetime({ offset: true }),
})

export const coursePlaceSchema = z.object({
  place_id: z.number().int(),
  name: z.string(),
  category: placeCategorySchema,
  image_url: z.string().nullable(),
  lat: z.number(),
  lng: z.number(),
  sequence: z.number().int(),
  stay_minutes: z.number().int().nullable(),
  travel_minutes: z.number().int().nullable(),
  travel_distance_meters: z.number().int().nullable(),
  visit_time: backendDateTimeSchema.nullable().optional(),
})

export const courseSchema = z.object({
  course_id: z.number().int(),
  title: z.string(),
  start_lat: z.number(),
  start_lng: z.number(),
  walk_date: backendDateTimeSchema.nullable(),
  total_distance_meters: z.number(),
  total_duration_minutes: z.number(),
  path: z.array(z.tuple([z.number(), z.number()])),
  places: z.array(coursePlaceSchema),
  is_owner: z.boolean(),
  is_shared: z.boolean(),
  like_count: z.number().int(),
  is_liked: z.boolean(),
  save_count: z.number().int(),
  is_saved: z.boolean(),
  generation_duration_ms: z.number().int().nullable().optional(),
})

export const courseSummarySchema = z.object({
  course_id: z.number().int(),
  title: z.string(),
  created_at: backendDateTimeSchema.optional(),
  dog_size: z.enum(["SMALL", "MEDIUM", "LARGE"]).nullable().optional(),
  start_lat: z.number(),
  start_lng: z.number(),
  distance_meters: z.number().int().nullable().optional(),
  total_distance_meters: z.number().int(),
  total_duration_minutes: z.number().int(),
  place_count: z.number().int(),
  thumbnail_image_url: z.string().nullable(),
  is_owner: z.boolean(),
  like_count: z.number().int(),
  is_liked: z.boolean(),
  save_count: z.number().int(),
  is_saved: z.boolean(),
})

export const nearbyCoursesSchema = z.array(courseSummarySchema)
export const myCoursesSchema = z.array(courseSummarySchema)
export const courseSaveStatusSchema = z.object({
  course_id: z.number().int(),
  is_saved: z.boolean(),
  save_count: z.number().int(),
})

export const courseLikeStatusSchema = z.object({
  course_id: z.number().int(),
  is_liked: z.boolean(),
  like_count: z.number().int(),
})

export const coursePlacesReplaceRequestSchema = z.object({
  places: z.array(coursePlaceSchema),
  path: z.array(z.tuple([z.number(), z.number()])),
  ended_at: z.string().datetime({ offset: true }).nullable().optional(),
})

export const nearbyCoursesParamsSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radius_m: z.number().int().min(100).max(20_000).optional(),
  limit: z.number().int().min(1).max(50).optional(),
  offset: z.number().int().min(0).optional(),
})

export type CourseCreateRequest = z.input<typeof courseCreateRequestSchema>
export type Course = z.output<typeof courseSchema>
export type NearbyCoursesParams = z.input<typeof nearbyCoursesParamsSchema>
export type NearbyCourse = z.output<typeof courseSummarySchema>
export type CourseSummary = z.output<typeof courseSummarySchema>
export type CoursePlacesReplaceRequest = z.input<
  typeof coursePlacesReplaceRequestSchema
>
