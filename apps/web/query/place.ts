import { queryOptions } from "@tanstack/react-query"

import { getNearbyPlaces } from "@/api/place"
import type { NearbyPlaceParams } from "@/schema/place"

export const nearbyPlacesQueryOptions = (params: NearbyPlaceParams) =>
  queryOptions({
    queryKey: ["places", "nearby", params] as const,
    queryFn: () => getNearbyPlaces(params),
  })
