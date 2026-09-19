import { z } from "zod"

export const placeSearchCategorySchema = z.enum([
  "식당",
  "카페",
  "산책",
  "액티비티",
])

export const nearbyPlaceParamsSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  category: placeSearchCategorySchema,
  radius_m: z.number().int().min(100).max(20_000).optional(),
  limit: z.number().int().min(1).max(50).optional(),
})

export const nearbyPlaceSchema = z.object({
  content_id: z.string(),
  title: z.string(),
  category: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  dist: z.number(),
  image_url: z.string().nullable(),
  overview: z.string().nullable(),
  open_time: z.string().nullable(),
  rest_day: z.string().nullable(),
  pet_accompany_type: z.string().nullable(),
  pet_need_materials: z.string().nullable(),
  pet_caution: z.string().nullable(),
  pet_facilities: z.string().nullable(),
  place_id: z.number().int(),
  like_count: z.number().int(),
  is_liked: z.boolean(),
})

export const nearbyPlacesSchema = z.array(nearbyPlaceSchema)

export type NearbyPlaceParams = z.input<typeof nearbyPlaceParamsSchema>
