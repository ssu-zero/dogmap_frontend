import { NextResponse } from "next/server"

type RouteContext = { params: Promise<{ path: string[] }> }

async function proxy(request: Request, { params }: RouteContext) {
  const { path } = await params
  const apiOrigin = process.env.DOGMAP_API_ORIGIN ?? "http://localhost:8000"
  const target = new URL(path.join("/"), `${apiOrigin}/`)
  const headers = new Headers(request.headers)

  headers.delete("host")
  headers.delete("content-length")

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      // api.dogmap.store can canonicalize an upstream URL with HTTP 308.
      // Following it inside the server-side proxy preserves a POST request and
      // prevents Ky in the browser from treating the intermediate redirect as
      // a failed login response.
      redirect: "follow",
    })

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: { "content-type": response.headers.get("content-type") ?? "" },
    })
  } catch {
    return NextResponse.json(
      { detail: "API 서버에 연결하지 못했습니다." },
      { status: 502 }
    )
  }
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
