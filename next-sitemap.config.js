/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://snippetly.vercel.app",
  generateRobotsTxt: true,
  exclude: ["/api/*", "/admin/*", "/_next/*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/_next/"],
      },
    ],
    additionalSitemaps: [
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "https://snippetly.vercel.app"
      }/sitemap.xml`,
    ],
  },
};
