import ky, { HTTPError, type ResponsePromise } from "ky"
import { z } from "zod"

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().min(1).default("/backend-api/"),
})

const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
})

const ACCESS_TOKEN_STORAGE_KEY = "dogmap.access-token"
const SIGNUP_TOKEN_STORAGE_KEY = "dogmap.signup-token"

const apiErrorBodySchema = z.object({
  detail: z.string().optional(),
})

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
}

export function getSignupToken() {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage.getItem(SIGNUP_TOKEN_STORAGE_KEY)
}

export function setAccessToken(accessToken: string) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
  window.localStorage.removeItem(SIGNUP_TOKEN_STORAGE_KEY)
  window.dispatchEvent(new Event("dogmap:auth-changed"))
}

export function setSignupToken(signupToken: string) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  window.localStorage.setItem(SIGNUP_TOKEN_STORAGE_KEY, signupToken)
  window.dispatchEvent(new Event("dogmap:auth-changed"))
}

export function clearAccessToken() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(SIGNUP_TOKEN_STORAGE_KEY)
  window.dispatchEvent(new Event("dogmap:auth-changed"))
}

export function getBearerToken() {
  return getAccessToken() ?? getSignupToken()
}

export const apiClient = ky.create({
  baseUrl: clientEnv.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  retry: {
    limit: 1,
    methods: ["get"],
  },
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const accessToken = getBearerToken()

        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`)
        }
      },
    ],
    afterResponse: [
      ({ response }) => {
        if (response.status === 401) {
          clearAccessToken()
        }
      },
    ],
    beforeError: [
      async ({ error }) => {
        if (!(error instanceof HTTPError)) {
          return error
        }

        // Ky v2 consumes an error response while populating `error.data`.
        // Cloning that already-consumed response throws before the login UI
        // can render its recovery state, so always read Ky's parsed payload.
        const body = apiErrorBodySchema.safeParse(error.data)
        const message = body.success
          ? (body.data.detail ?? error.message)
          : error.message

        return new ApiError(message, error.response.status)
      },
    ],
  },
})

export async function parseResponse<TSchema extends z.ZodType>(
  response: ResponsePromise,
  schema: TSchema
): Promise<z.output<TSchema>> {
  return schema.parse(await response.json())
}
