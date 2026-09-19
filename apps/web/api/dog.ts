import { apiClient, parseResponse } from "@/api/client"
import {
  dogCreateRequestSchema,
  dogSchema,
  dogUpdateRequestSchema,
  presignedUploadRequestSchema,
  presignedUploadResponseSchema,
  signupCompleteResponseSchema,
  type DogCreateRequest,
  type DogUpdateRequest,
  type PresignedUploadRequest,
} from "@/schema/dog"

export function getMyDog() {
  return parseResponse(apiClient.get("api/dogs/me"), dogSchema)
}

export async function registerDog(input: DogCreateRequest) {
  return parseResponse(
    apiClient.post("api/dogs", { json: dogCreateRequestSchema.parse(input) }),
    signupCompleteResponseSchema
  )
}

export async function updateMyDog(input: DogUpdateRequest) {
  return parseResponse(
    apiClient.patch("api/dogs/me", { json: dogUpdateRequestSchema.parse(input) }),
    dogSchema
  )
}

export function getMyDogImageUploadUrl(input: PresignedUploadRequest) {
  return parseResponse(
    apiClient.post("api/dogs/me/image/presigned-url", {
      json: presignedUploadRequestSchema.parse(input),
    }),
    presignedUploadResponseSchema
  )
}
