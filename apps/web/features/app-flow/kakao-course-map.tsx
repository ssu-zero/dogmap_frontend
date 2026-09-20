"use client"

import Script from "next/script"
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
  const [sdkReady, setSdkReady] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY
  const markerCoordinates = useMemo(
    () => createMarkerCoordinates(center, path, places.length),
    [center, path, places.length]
  )

  useEffect(() => {
    if (!sdkReady || !window.kakao?.maps || !containerRef.current) return

    window.kakao.maps.load(() => {
      const maps = window.kakao?.maps
      const container = containerRef.current
      if (!maps || !container) return

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
          if (place) onSelectPlace(place)
        })
      })

      if (routePositions.length > 1 || markerCoordinates.length > 1) {
        map.setBounds(bounds)
      }
      map.relayout()
    })
  }, [center, markerCoordinates, onSelectPlace, path, places, sdkReady])

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
      <Script
        id="kakao-map-sdk"
        src={`https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${appKey}`}
        strategy="afterInteractive"
        onReady={() => {
          if (window.kakao?.maps) setSdkReady(true)
          else setLoadError(true)
        }}
        onError={() => setLoadError(true)}
      />
      <div ref={containerRef} className="size-full" />
      {loadError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 px-5 text-center">
          <p className="type-body-r-14 text-gray-500">
            지도를 불러오지 못했어요. 등록된 Web 도메인을 확인해 주세요.
          </p>
        </div>
      ) : null}
      {!sdkReady ? (
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
  const [sdkReady, setSdkReady] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY

  useEffect(() => {
    onSelectRef.current = onSelectCoordinates
  }, [onSelectCoordinates])

  useEffect(() => {
    if (!sdkReady || !window.kakao?.maps || !containerRef.current) return

    window.kakao.maps.load(() => {
      const maps = window.kakao?.maps
      const container = containerRef.current
      if (!maps || !container) return

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
    })
  }, [center, sdkReady])

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
      <Script
        id="kakao-location-picker-sdk"
        src={`https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${appKey}`}
        strategy="afterInteractive"
        onReady={() => {
          if (window.kakao?.maps) setSdkReady(true)
          else setLoadError(true)
        }}
        onError={() => setLoadError(true)}
      />
      <div ref={containerRef} className="size-full" />
      {loadError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 px-5 text-center">
          <p className="type-body-r-14 text-gray-500">
            지도를 불러오지 못했어요. 등록된 Web 도메인을 확인해 주세요.
          </p>
        </div>
      ) : null}
      {!sdkReady ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-100/80">
          <p className="type-body-r-14 text-gray-500">지도를 불러오는 중이에요.</p>
        </div>
      ) : null}
    </section>
  )
}

export { fallbackCoordinates }
