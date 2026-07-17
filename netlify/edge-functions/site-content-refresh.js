export default async function siteContentRefresh(request, context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('text/html')) return response;

  let html = await response.text();
  const url = new URL(request.url);

  // Homepage: correct operating years while preserving the original design.
  if (url.pathname === '/' || url.pathname === '/index.html') {
    html = html
      .replace(/>12<em>\+<\/em></g, '>10<em>+</em><')
      .replace(/>12\+<\/div>/g, '>10+</div>')
      .replace(/12\+\s*Years/gi, '10+ Years');
  }

  // About Us: replace the legacy timeline with the approved company history.
  if (url.pathname === '/about-us' || url.pathname === '/about-us.html') {
    const timelineStart = html.indexOf('<div class="timeline" role="list">');
    const storyRightStart = html.indexOf('<div class="story-right">', timelineStart);

    if (timelineStart !== -1 && storyRightStart !== -1) {
      const approvedTimeline = `<div class="timeline" role="list">
            <div class="tl-item" role="listitem">
              <div class="tl-dot" aria-hidden="true"></div>
              <div class="tl-year">2012</div>
              <div class="tl-title">Ready Set Tow Founded</div>
              <p class="tl-desc">Henry Beard purchased a truck and trailer and started the original business, Ready Set Tow, a hotshot transportation company built on dependable service and hands-on execution.</p>
            </div>
            <div class="tl-item" role="listitem">
              <div class="tl-dot" aria-hidden="true"></div>
              <div class="tl-year">2016</div>
              <div class="tl-title">Beard Logistics Launched</div>
              <p class="tl-desc">Beard Logistics launched in Baton Rouge as a Landstar agency, expanding the company from asset-based hotshot transportation into broader freight and logistics services.</p>
            </div>
            <div class="tl-item" role="listitem">
              <div class="tl-dot" aria-hidden="true"></div>
              <div class="tl-year">2018</div>
              <div class="tl-title">ACME Truck Line Terminal Acquired</div>
              <p class="tl-desc">The company acquired the ACME Truck Line Baton Rouge terminal, strengthening local and regional trucking capacity and expanding specialized transportation operations.</p>
            </div>
            <div class="tl-item" role="listitem">
              <div class="tl-dot" aria-hidden="true"></div>
              <div class="tl-year">2019</div>
              <div class="tl-title">Freight Broker Authority Acquired</div>
              <p class="tl-desc">Beard Logistics secured its freight broker authority, expanding access to a nationwide carrier network and supporting larger, more complex customer requirements.</p>
            </div>
            <div class="tl-item" role="listitem">
              <div class="tl-dot" aria-hidden="true"></div>
              <div class="tl-year">2022</div>
              <div class="tl-title">Cross-Docking &amp; Warehouse Expansion</div>
              <p class="tl-desc">Cross-docking and warehouse capabilities expanded in Baton Rouge, adding storage, freight recovery, rework, transloading, and distribution support near I-10 and I-12.</p>
            </div>
            <div class="tl-item" role="listitem">
              <div class="tl-dot" aria-hidden="true"></div>
              <div class="tl-year">2025</div>
              <div class="tl-title">Chemical Distribution Launched</div>
              <p class="tl-desc">Beard Logistics launched chemical distribution services, extending its capabilities across Louisiana's industrial and petrochemical markets.</p>
            </div>
            <div class="tl-item" role="listitem">
              <div class="tl-dot" aria-hidden="true"></div>
              <div class="tl-year">Today</div>
              <div class="tl-title">Seven-Figure Operation &amp; Growing</div>
              <p class="tl-desc">Today, Beard Logistics is a seven-figure transportation, warehousing, freight brokerage, and distribution operation serving customers across the Gulf South and nationwide—and continuing to grow.</p>
            </div>
          </div>
        </div>
        `;

      html = html.slice(0, timelineStart) + approvedTimeline + html.slice(storyRightStart);
    }

    html = html
      .replace('Built from the ground up in Baton Rouge since 2012 — and still growing.', 'Built from one truck and trailer into a seven-figure logistics operation—and still growing.')
      .replace('founded in 2012 by U.S. veteran Henry Beard', 'grown from a hotshot company founded in 2012 into Beard Logistics, launched in 2016 by U.S. veteran Henry Beard')
      .replace('Founded in 2012 by a U.S. veteran, Beard Logistics', 'Beginning with Ready Set Tow in 2012 and launching Beard Logistics in 2016, the veteran-owned company');
  }

  const headers = new Headers(response.headers);
  headers.set('cache-control', 'no-cache, no-store, must-revalidate');
  headers.delete('content-length');

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
