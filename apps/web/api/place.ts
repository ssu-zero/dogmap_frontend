import { apiClient, parseResponse } from "@/api/client"
import {
  nearbyPlaceParamsSchema,
  nearbyPlacesSchema,
  type NearbyPlaceParams,
} from "@/schema/place"

export function getNearbyPlaces(input: NearbyPlaceParams) {
  const params = nearbyPlaceParamsSchema.parse(input)
  return parseResponse(
    apiClient.get("api/places", { searchParams: params }),
    nearbyPlacesSchema
  )
}
