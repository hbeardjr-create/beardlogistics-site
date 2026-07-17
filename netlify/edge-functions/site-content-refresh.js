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

  // About Us: replace the legacy timeline with the approved, expanded company history.
  if (url.pathname === '/about-us' || url.pathname === '/about-us/' || url.pathname === '/about-us.html') {
    // The founder portrait is JPEG data that was incorrectly labeled as PNG.
    html = html.replace(/data:image\/png;base64,\/9j\//g, 'data:image/jpeg;base64,/9j/');

    const timelineStart = html.indexOf('<div class="timeline" role="list">');
    const storyRightStart = html.indexOf('<div class="story-right">', timelineStart);

    if (timelineStart !== -1 && storyRightStart !== -1) {
      const approvedTimeline = `<div class="timeline" role="list">
            <div class="tl-item" role="listitem">
              <div class="tl-dot" aria-hidden="true"></div>
              <div class="tl-year">2012</div>
              <div class="tl-title">Ready Set Tow — The Beginning</div>
              <p class="tl-desc">Henry Beard purchased his first truck and trailer and launched Ready Set Tow, a hands-on hotshot transportation company. Those early years were built on long hours, direct customer service, careful load planning, and a willingness to personally manage every detail from pickup through delivery. The experience created the operating discipline, customer relationships, and real-world transportation knowledge that would later become the foundation of Beard Logistics.</p>
            </div>
            <div class="tl-item" role="listitem">
              <div class="tl-dot" aria-hidden="true"></div>
              <div class="tl-year">2016</div>
              <div class="tl-title">Beard Logistics Launched as a Landstar Agency</div>
              <p class="tl-desc">Building on the experience gained through Ready Set Tow, Henry expanded the business and launched Beard Logistics as a Landstar agency. This milestone provided access to a broader national transportation network, more equipment options, stronger carrier capacity, and the ability to serve customers with freight brokerage, expedited transportation, specialized hauling, and full truckload solutions across the United States.</p>
            </div>
            <div class="tl-item" role="listitem">
              <div class="tl-dot" aria-hidden="true"></div>
              <div class="tl-year">2018</div>
              <div class="tl-title">ACME Truck Line Baton Rouge Terminal Acquired</div>
              <p class="tl-desc">Beard Logistics expanded its asset-based and energy-sector capabilities by acquiring the ACME Truck Line terminal in Baton Rouge. The terminal strengthened the company’s presence in oil and gas, petrochemical, pipeline, industrial, and emergency freight transportation while adding local dispatch control, dedicated owner-operator relationships, and specialized equipment capacity throughout Louisiana and the Gulf Coast.</p>
            </div>
            <div class="tl-item" role="listitem">
              <div class="tl-dot" aria-hidden="true"></div>
              <div class="tl-year">2019</div>
              <div class="tl-title">Independent Freight Broker Authority Acquired</div>
              <p class="tl-desc">The company secured its own freight broker authority, creating greater flexibility to design transportation solutions, build direct carrier relationships, and support customers beyond any single network. This expansion strengthened Beard Logistics’ ability to manage complex shipments, source outside capacity, negotiate competitive transportation rates, and provide customers with one accountable logistics partner.</p>
            </div>
            <div class="tl-item" role="listitem">
              <div class="tl-dot" aria-hidden="true"></div>
              <div class="tl-year">2022</div>
              <div class="tl-title">Cross-Docking and Warehouse Operations Expanded</div>
              <p class="tl-desc">Beard Logistics expanded into cross-docking, transloading, freight recovery, short-term storage, rework, restacking, and warehouse support from its Baton Rouge facility near I-10 and I-12. This investment allowed the company to solve rejected-load problems, recover shifted freight, transfer cargo between trailers, stage products, and provide customers with a dependable local logistics hub for time-sensitive and specialized projects.</p>
            </div>
            <div class="tl-item" role="listitem">
              <div class="tl-dot" aria-hidden="true"></div>
              <div class="tl-year">2025</div>
              <div class="tl-title">Chemical Distribution Division Launched</div>
              <p class="tl-desc">The company launched chemical distribution services to better support industrial, commercial, transportation, and facility customers throughout Louisiana and the Gulf South. This division combined Beard Logistics’ transportation expertise, warehousing capabilities, regulatory awareness, and customer-service model to provide a more complete supply-chain solution for chemical products and related distribution needs.</p>
            </div>
            <div class="tl-item" role="listitem">
              <div class="tl-dot" aria-hidden="true"></div>
              <div class="tl-year">Today</div>
              <div class="tl-title">A Seven-Figure Logistics Operation — Still Growing</div>
              <p class="tl-desc">Today, Beard Logistics operates as a seven-figure, veteran-owned logistics company with capabilities spanning freight brokerage, expedited transportation, specialized hauling, ACME terminal operations, cross-docking, warehousing, freight recovery, and chemical distribution. What began with one truck and one trailer has grown into a multi-division operation serving industrial companies, national corporations, government agencies, and customers across the Gulf South and nationwide—with the same commitment to reliability, accountability, and moving freight forward.</p>
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
