import ky, { HTTPError, type ResponsePromise } from "ky"
import { z } from "zod"

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url().default("http://localhost:8080"),
})

const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
})

const ACCESS_TOKEN_STORAGE_KEY = "dogmap.access-token"

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

export function setAccessToken(accessToken: string) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
}

export function clearAccessToken() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
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
        const accessToken = getAccessToken()

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

        const body = apiErrorBodySchema.safeParse(
          await error.response
            .clone()
            .json()
            .catch(() => undefined)
        )
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
