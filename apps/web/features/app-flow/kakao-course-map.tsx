"use client"

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"

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
  setCenter: (position: KakaoLatLng) => void
  relayout: () => void
}

type KakaoBounds = { extend: (position: unknown) => void }
type KakaoLatLng = { getLat: () => number; getLng: () => number }
type KakaoMouseEvent = { latLng: KakaoLatLng }
type KakaoMarker = { setPosition: (position: unknown) => void }
type KakaoPlace = {
  id: string
  place_name: string
  road_address_name: string
  address_name: string
  x: string
  y: string
}
type KakaoPlacesService = {
  keywordSearch: (
    keyword: string,
    callback: (results: KakaoPlace[], status: string) => void,
    options?: { size: number }
  ) => void
}

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
  services?: {
    Places: new () => KakaoPlacesService
    Status: { OK: string; ZERO_RESULT: string; ERROR: string }
  }
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
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&libraries=services&appkey=${appKey}`
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
  selectedLabel: string
  onSelectLocation: (coordinates: Coordinates, label: string) => void
  className?: string
}

export function KakaoLocationPicker({
  center,
  selectedLabel,
  onSelectLocation,
  className,
}: KakaoLocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialCenterRef = useRef(center)
  const mapRef = useRef<KakaoMapInstance | null>(null)
  const markerRef = useRef<KakaoMarker | null>(null)
  const onSelectRef = useRef(onSelectLocation)
  const searchRequestRef = useRef(0)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<KakaoPlace[]>([])
  const [searchState, setSearchState] = useState<
    "idle" | "loading" | "empty" | "error"
  >("idle")
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY
  const { maps, loadError, retry } = useKakaoMaps(appKey)

  useEffect(() => {
    onSelectRef.current = onSelectLocation
  }, [onSelectLocation])

  useEffect(() => {
    if (!maps || !containerRef.current) return

    const container = containerRef.current
    const initialCenter = initialCenterRef.current
    const map = new maps.Map(container, {
      center: new maps.LatLng(initialCenter.lat, initialCenter.lng),
      level: 3,
    })
    const marker = new maps.Marker({
      map,
      position: new maps.LatLng(initialCenter.lat, initialCenter.lng),
    })
    mapRef.current = map
    markerRef.current = marker

    maps.event.addListener(map, "click", (mouseEvent) => {
      marker.setPosition(mouseEvent.latLng)
      searchRequestRef.current += 1
      setResults([])
      setQuery("")
      setSearchState("idle")
      onSelectRef.current(
        {
          lat: mouseEvent.latLng.getLat(),
          lng: mouseEvent.latLng.getLng(),
        },
        "선택한 위치"
      )
    })
    map.relayout()

    return () => {
      mapRef.current = null
      markerRef.current = null
    }
  }, [maps])

  function searchPlaces(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const keyword = query.trim()
    if (!keyword) {
      setResults([])
      setSearchState("idle")
      return
    }

    const services = maps?.services
    if (!services) {
      setSearchState("error")
      return
    }

    const request = ++searchRequestRef.current
    setResults([])
    setSearchState("loading")
    new services.Places().keywordSearch(
      keyword,
      (places, status) => {
        if (request !== searchRequestRef.current) return

        if (status === services.Status.OK) {
          const validPlaces = places.filter(
            (place) =>
              Number.isFinite(Number(place.x)) &&
              Number.isFinite(Number(place.y))
          )
          setResults(validPlaces)
          setSearchState(validPlaces.length ? "idle" : "empty")
        } else {
          setResults([])
          setSearchState(
            status === services.Status.ZERO_RESULT ? "empty" : "error"
          )
        }
      },
      { size: 10 }
    )
  }

  function selectPlace(place: KakaoPlace) {
    if (!maps) return

    const coordinates = { lat: Number(place.y), lng: Number(place.x) }
    const position = new maps.LatLng(coordinates.lat, coordinates.lng)
    mapRef.current?.setCenter(position)
    markerRef.current?.setPosition(position)
    searchRequestRef.current += 1
    setResults([])
    setSearchState("idle")
    setQuery(place.place_name)
    onSelectRef.current(coordinates, place.place_name)
  }

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
      <div className="absolute inset-x-3 top-3 z-10">
        <form
          className="flex h-12 items-center gap-2 rounded-xl bg-white px-3 shadow-[0_2px_10px_rgba(0,0,0,0.12)]"
          onSubmit={searchPlaces}
          role="search"
        >
          <input
            type="search"
            aria-label="출발 장소 검색"
            placeholder="장소를 검색해 주세요"
            value={query}
            onChange={(event) => {
              searchRequestRef.current += 1
              setQuery(event.target.value)
              setResults([])
              setSearchState("idle")
            }}
            className="type-body-r-14 min-w-0 flex-1 bg-transparent text-gray-600 outline-none placeholder:text-gray-300"
          />
          <button
            type="submit"
            disabled={!query.trim() || !maps}
            className="type-body-sb-14 shrink-0 text-red-500 disabled:text-gray-300"
          >
            검색
          </button>
        </form>
        {results.length > 0 ? (
          <ul className="mt-2 max-h-64 overflow-y-auto rounded-xl bg-white py-1 shadow-[0_2px_10px_rgba(0,0,0,0.12)]">
            {results.map((place) => (
              <li key={place.id} className="border-b border-gray-100 last:border-b-0">
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left"
                  onClick={() => selectPlace(place)}
                >
                  <span className="type-body-sb-14 block text-gray-600">
                    {place.place_name}
                  </span>
                  <span className="type-caption-r-12 mt-1 block text-gray-400">
                    {place.road_address_name || place.address_name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : searchState !== "idle" ? (
          <p
            className="type-body-r-14 mt-2 rounded-xl bg-white px-4 py-3 text-gray-500 shadow-[0_2px_10px_rgba(0,0,0,0.12)]"
            role="status"
          >
            {searchState === "loading"
              ? "장소를 찾고 있어요."
              : searchState === "empty"
                ? "검색 결과가 없어요. 다른 장소명을 입력해 주세요."
                : "검색에 실패했어요. 다시 시도해 주세요."}
          </p>
        ) : null}
      </div>
      {!loadError && maps ? (
        <p className="type-body-r-14 pointer-events-none absolute right-3 bottom-3 left-3 rounded-lg bg-white/95 px-4 py-3 text-center text-gray-600 shadow-sm">
          {selectedLabel || "지도에서 출발 위치를 누르거나 장소를 검색해 주세요."}
        </p>
      ) : null}
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
