type PlaceCoordinates = { lat: number; lng: number }

/** Kakao Maps' public map and search URLs work on both desktop and mobile. */
export function kakaoPlaceUrl(name: string, coordinates?: PlaceCoordinates) {
  const label = encodeURIComponent(name)
  return coordinates &&
    Number.isFinite(coordinates.lat) &&
    Number.isFinite(coordinates.lng)
    ? `https://map.kakao.com/link/map/${label},${coordinates.lat},${coordinates.lng}`
    : `https://map.kakao.com/link/search/${label}`
}
