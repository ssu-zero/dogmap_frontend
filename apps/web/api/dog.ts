import { apiClient, parseResponse } from "@/api/client"
import {
  dogCreateRequestSchema,
  dogSchema,
  dogUpdateRequestSchema,
  signupCompleteResponseSchema,
  type DogCreateRequest,
  type DogUpdateRequest,
} from "@/schema/dog"

export function getMyDog() {
  return parseResponse(apiClient.get("dogs/me"), dogSchema)
}

export async function registerDog(input: DogCreateRequest) {
  return parseResponse(
    apiClient.post("dogs", { json: dogCreateRequestSchema.parse(input) }),
    signupCompleteResponseSchema
  )
}

export async function updateMyDog(input: DogUpdateRequest) {
  return parseResponse(
    apiClient.patch("dogs/me", { json: dogUpdateRequestSchema.parse(input) }),
    dogSchema
  )
}
