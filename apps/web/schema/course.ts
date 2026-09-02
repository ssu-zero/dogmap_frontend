import { z } from "zod"

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
})

export const courseSchema = z.object({
  course_id: z.number().int(),
  title: z.string(),
  start_lat: z.number(),
  start_lng: z.number(),
  total_distance_meters: z.number(),
  total_duration_minutes: z.number(),
  path: z.array(z.tuple([z.number(), z.number()])),
  places: z.array(coursePlaceSchema),
})

export const nearbyCourseSchema = z.object({
  course_id: z.number().int(),
  title: z.string(),
  start_lat: z.number(),
  start_lng: z.number(),
  distance_meters: z.number().int(),
  total_distance_meters: z.number().int(),
  total_duration_minutes: z.number().int(),
  place_count: z.number().int(),
  thumbnail_image_url: z.string().nullable(),
})

export const nearbyCoursesSchema = z.array(nearbyCourseSchema)

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
export type NearbyCourse = z.output<typeof nearbyCourseSchema>
