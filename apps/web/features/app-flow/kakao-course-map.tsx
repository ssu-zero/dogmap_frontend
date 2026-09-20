"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

type Coordinates = { lat: number; lng: number }

type KakaoMapProps = {
  center: Coordinates
  path?: [number, number][]
  places: string[]
  onSelectPlace: (place: string) => void
  className?: string
}

type KakaoMapInstance = {
  setBounds: (bounds: KakaoBounds) => void
  relayout: () => void
}

type KakaoBounds = { extend: (position: unknown) => void }
type KakaoLatLng = { getLat: () => number; getLng: () => number }
type KakaoMouseEvent = { latLng: KakaoLatLng }
type KakaoMarker = { setPosition: (position: unknown) => void }

type KakaoMaps = {
  load: (callback: () => void) => void
  Map: new (container: HTMLElement, options: { center: unknown; level: number }) => KakaoMapInstance
  LatLng: new (lat: number, lng: number) => KakaoLatLng
  LatLngBounds: new () => KakaoBounds
  Polyline: new (options: {
    map: KakaoMapInstance
    path: unknown[]
    strokeWeight: number
    strokeColor: string
    strokeOpacity: number
    strokeStyle: "solid"
  }) => unknown
  Marker: new (options: { map: KakaoMapInstance; position: unknown }) => KakaoMarker
  event: {
    addListener: (
      target: unknown,
      event: "click",
      callback: (mouseEvent: KakaoMouseEvent) => void
    ) => void
  }
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps }
  }
}

const fallbackCoordinates: Coordinates = { lat: 35.9402, lng: 126.9463 }

let kakaoMapsPromise: Promise<KakaoMaps> | null = null

function loadKakaoMaps(appKey: string) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Kakao Maps can only load in a browser."))
  }

  if (kakaoMapsPromise) return kakaoMapsPromise

  kakaoMapsPromise = new Promise<KakaoMaps>((resolve, reject) => {
    let settled = false
    const settle = (callback: () => void) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeoutId)
      callback()
    }
    const rejectLoad = () => {
      kakaoMapsPromise = null
      settle(() => reject(new Error("Unable to load Kakao Maps.")))
    }
    const initialize = () => {
      const maps = window.kakao?.maps
      if (!maps) {
        rejectLoad()
        return
      }

      maps.load(() => settle(() => resolve(maps)))
    }
    const timeoutId = window.setTimeout(rejectLoad, 10_000)

    if (window.kakao?.maps) {
      initialize()
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-kakao-maps-sdk="true"]'
    )
    if (existingScript) {
      existingScript.addEventListener("load", initialize, { once: true })
      existingScript.addEventListener("error", rejectLoad, { once: true })
      return
    }

    const script = document.createElement("script")
    script.dataset.kakaoMapsSdk = "true"
    script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${appKey}`
    script.addEventListener("load", initialize, { once: true })
    script.addEventListener("error", rejectLoad, { once: true })
    document.head.appendChild(script)
  })

  return kakaoMapsPromise
}

function useKakaoMaps(appKey: string | undefined) {
  const [maps, setMaps] = useState<KakaoMaps | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    if (!appKey) return

    let cancelled = false
    setLoadError(false)

    loadKakaoMaps(appKey).then(
      (sdk) => {
        if (!cancelled) setMaps(sdk)
      },
      () => {
        if (!cancelled) setLoadError(true)
      }
    )

    return () => {
      cancelled = true
    }
  }, [appKey, loadAttempt])

  return {
    maps,
    loadError,
    retry: () => {
      kakaoMapsPromise = null
      document
        .querySelector('script[data-kakao-maps-sdk="true"]')
        ?.remove()
      setMaps(null)
      setLoadAttempt((attempt) => attempt + 1)
    },
  }
}

function MapLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-100 px-5 text-center">
      <p className="type-body-r-14 text-gray-500">
        지도를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
      <button
        type="button"
        className="type-body-sb-14 rounded-lg bg-white px-4 py-2 text-gray-600 shadow-sm"
        onClick={onRetry}
      >
        다시 시도
      </button>
    </div>
  )
}

function createMarkerCoordinates(
  center: Coordinates,
  path: [number, number][],
  count: number
) {
  if (path.length > 0 && count > 0) {
    return Array.from({ length: count }, (_, index) => {
      const point =
        path[
          Math.min(
            path.length - 1,
            Math.round((index / Math.max(count - 1, 1)) * (path.length - 1))
          )
        ] ?? [center.lat, center.lng]
      return { lat: point[0], lng: point[1] }
    })
  }

  return Array.from({ length: count }, (_, index) => ({
    lat: center.lat + (index - Math.floor(count / 2)) * 0.002,
    lng: center.lng + (index - Math.floor(count / 2)) * 0.002,
  }))
}

export function KakaoCourseMap({
  center,
  path = [],
  places,
  onSelectPlace,
  className,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onSelectPlaceRef = useRef(onSelectPlace)
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY
  const { maps, loadError, retry } = useKakaoMaps(appKey)
  const markerCoordinates = useMemo(
    () => createMarkerCoordinates(center, path, places.length),
    [center, path, places.length]
  )

  useEffect(() => {
    onSelectPlaceRef.current = onSelectPlace
  }, [onSelectPlace])

  useEffect(() => {
    if (!maps || !containerRef.current) return

    const container = containerRef.current
    const map = new maps.Map(container, {
      center: new maps.LatLng(center.lat, center.lng),
      level: 4,
    })
    const bounds = new maps.LatLngBounds()
    const route = path.length > 0 ? path : [[center.lat, center.lng]]
    const routePositions = route.map(
      (point) => new maps.LatLng(point[0] ?? center.lat, point[1] ?? center.lng)
    )

    routePositions.forEach((position) => bounds.extend(position))
    if (routePositions.length > 1) {
      new maps.Polyline({
        map,
        path: routePositions,
        strokeWeight: 5,
        strokeColor: "#e84444",
        strokeOpacity: 0.9,
        strokeStyle: "solid",
      })
    }

    markerCoordinates.forEach((coordinates, index) => {
      const position = new maps.LatLng(coordinates.lat, coordinates.lng)
      const marker = new maps.Marker({ map, position })
      bounds.extend(position)
      maps.event.addListener(marker, "click", () => {
        const place = places[index]
        if (place) onSelectPlaceRef.current(place)
      })
    })

    if (routePositions.length > 1 || markerCoordinates.length > 1) {
      map.setBounds(bounds)
    }
    map.relayout()
  }, [center, maps, markerCoordinates, path, places])

  if (!appKey) {
    return (
      <section className={cn("flex h-84 items-center justify-center bg-gray-100 px-5 text-center", className)}>
        <p className="type-body-r-14 text-gray-500">
          카카오맵 키를 확인한 뒤 실제 지도를 표시할 수 있어요.
        </p>
      </section>
    )
  }

  return (
    <section className={cn("relative h-84 overflow-hidden bg-gray-100", className)} aria-label="코스 지도">
      <div ref={containerRef} className="size-full" />
      {loadError ? <MapLoadError onRetry={retry} /> : null}
      {!maps && !loadError ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-100/80">
          <p className="type-body-r-14 text-gray-500">지도를 불러오는 중이에요.</p>
        </div>
      ) : null}
    </section>
  )
}

type KakaoLocationPickerProps = {
  center: Coordinates
  onSelectCoordinates: (coordinates: Coordinates) => void
  className?: string
}

export function KakaoLocationPicker({
  center,
  onSelectCoordinates,
  className,
}: KakaoLocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(onSelectCoordinates)
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY
  const { maps, loadError, retry } = useKakaoMaps(appKey)

  useEffect(() => {
    onSelectRef.current = onSelectCoordinates
  }, [onSelectCoordinates])

  useEffect(() => {
    if (!maps || !containerRef.current) return

    const container = containerRef.current
    const map = new maps.Map(container, {
      center: new maps.LatLng(center.lat, center.lng),
      level: 3,
    })
    const marker = new maps.Marker({
      map,
      position: new maps.LatLng(center.lat, center.lng),
    })

    maps.event.addListener(map, "click", (mouseEvent) => {
      marker.setPosition(mouseEvent.latLng)
      onSelectRef.current({
        lat: mouseEvent.latLng.getLat(),
        lng: mouseEvent.latLng.getLng(),
      })
    })
    map.relayout()
  }, [center, maps])

  if (!appKey) {
    return (
      <section
        className={cn(
          "flex h-80 items-center justify-center bg-gray-100 px-5 text-center",
          className
        )}
      >
        <p className="type-body-r-14 text-gray-500">
          카카오맵 키를 확인한 뒤 출발 위치를 선택할 수 있어요.
        </p>
      </section>
    )
  }

  return (
    <section
      className={cn("relative h-80 overflow-hidden bg-gray-100", className)}
      aria-label="출발 위치 지도"
    >
      <div ref={containerRef} className="size-full" />
      {loadError ? <MapLoadError onRetry={retry} /> : null}
      {!maps && !loadError ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-100/80">
          <p className="type-body-r-14 text-gray-500">지도를 불러오는 중이에요.</p>
        </div>
      ) : null}
    </section>
  )
}

export { fallbackCoordinates }
