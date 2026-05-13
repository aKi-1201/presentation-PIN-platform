import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.APP_URL ?? "https://zlide.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/p/", "/api/"]
      }
    ],
    sitemap: new URL("/sitemap.xml", siteUrl).toString()
  };
}