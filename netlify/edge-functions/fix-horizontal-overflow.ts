import type { Context, Config } from "@netlify/edge-functions";

export default async (_request: Request, context: Context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) return response;

  let html = await response.text();
  const overflowFix = `
<style id="beard-overflow-fix">
  html, body {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden !important;
  }
  body > *, header, main, section, footer, #hero, .trust-bar {
    max-width: 100%;
  }
  img, svg, video, iframe {
    max-width: 100%;
  }
  nav, .hero-inner, .inner, .footer-wrap {
    width: 100%;
  }
</style>`;

  if (!html.includes('id="beard-overflow-fix"')) {
    html = html.replace("</head>", `${overflowFix}\n</head>`);
  }

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};

export const config: Config = {
  path: "/*",
};
