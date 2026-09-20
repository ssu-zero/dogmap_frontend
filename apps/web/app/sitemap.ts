import type { MetadataRoute } from "next"

const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteOrigin,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteOrigin}/courses`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteOrigin}/community`,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ]
}
