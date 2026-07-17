import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let html = await response.text();
  const path = new URL(request.url).pathname;

  if (path === "/" || path === "/index.html") {
    html = html
      .replaceAll("12+", "10+")
      .replaceAll("Est. 2012", "Est. 2016")
      .replaceAll("EST. 2012", "EST. 2016")
      .replaceAll(">YEARS<", ">YEARS IN BUSINESS<");
  }

  if (path === "/certifications" || path === "/certifications.html") {
    const capabilityBlock = `
      <div id="official-capability-statement" class="download-bar">
        <div class="download-bar-text">
          <h3>Official Capability Statement</h3>
          <p>Review Beard Logistics transportation, warehousing, distribution, certifications, procurement IDs and NAICS classifications.</p>
        </div>
        <a class="btn-red" href="/capability-statement.html">View Capability Statement →</a>
      </div>`;

    if (!html.includes('id="official-capability-statement"')) {
      if (html.includes('<div class="download-bar">')) {
        html = html.replace('<div class="download-bar">', capabilityBlock + '\n<div class="download-bar">');
      } else {
        html = html.replace('</main>', `<section><div class="inner">${capabilityBlock}</div></section>\n</main>`);
      }
    }
  }

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};

export const config: Config = {
  path: ["/", "/index.html", "/certifications", "/certifications.html"],
};