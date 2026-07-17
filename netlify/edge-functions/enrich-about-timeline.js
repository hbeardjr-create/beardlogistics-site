export default async (request, context) => {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const url = new URL(request.url);
  if (url.pathname !== '/about-us' && url.pathname !== '/about-us/' && url.pathname !== '/about-us.html') {
    return response;
  }

  let html = await response.text();
  const timelineScript = `
<script>
(() => {
  const timeline = document.querySelector('#story .timeline');
  if (!timeline) return;
  const entries = [
    {
      year: '2012',
      title: 'Ready Set Tow — The Beginning',
      description: 'Henry Beard purchased his first truck and trailer and launched Ready Set Tow, a hands-on hotshot transportation company. Those early years were built on long hours, direct customer service, careful load planning, and a willingness to personally handle every detail from pickup through delivery. The experience created the operating discipline, customer relationships, and real-world transportation knowledge that would later become the foundation of Beard Logistics.'
    },
    {
      year: '2016',
      title: 'Beard Logistics Launched as a Landstar Agency',
      description: 'Building on the experience gained through Ready Set Tow, Henry expanded the business and launched Beard Logistics as a Landstar agency. This milestone gave the company access to a broader national transportation network, more equipment options, stronger carrier capacity, and the ability to serve customers with freight brokerage, expedited transportation, specialized hauling, and full truckload solutions across the United States.'
    },
    {
      year: '2018',
      title: 'ACME Truck Line Baton Rouge Terminal Acquired',
      description: 'Beard Logistics expanded its asset-based and energy-sector capabilities by acquiring the ACME Truck Line terminal in Baton Rouge. The terminal strengthened the company’s presence in oil and gas, petrochemical, pipeline, industrial, and emergency freight transportation while adding local dispatch control, dedicated owner-operator relationships, and specialized equipment capacity throughout Louisiana and the Gulf Coast.'
    },
    {
      year: '2019',
      title: 'Independent Freight Broker Authority Acquired',
      description: 'The company secured its own freight broker authority, creating greater flexibility to design transportation solutions, build direct carrier relationships, and support customers beyond any single network. This expansion strengthened Beard Logistics’ ability to manage complex shipments, source outside capacity, negotiate competitive transportation rates, and provide customers with one accountable logistics partner.'
    },
    {
      year: '2022',
      title: 'Cross-Docking and Warehouse Operations Expanded',
      description: 'Beard Logistics expanded into cross-docking, transloading, freight recovery, short-term storage, rework, restacking, and warehouse support from its Baton Rouge facility near I-10 and I-12. This investment allowed the company to solve rejected-load problems, recover shifted freight, transfer cargo between trailers, stage products, and provide customers with a dependable local logistics hub for time-sensitive and specialized projects.'
    },
    {
      year: '2025',
      title: 'Chemical Distribution Division Launched',
      description: 'The company launched chemical distribution services to better support industrial, commercial, transportation, and facility customers throughout Louisiana and the Gulf South. This division combined Beard Logistics’ transportation expertise, warehousing capabilities, regulatory awareness, and customer-service model to provide a more complete supply-chain solution for chemical products and related distribution needs.'
    },
    {
      year: 'Today',
      title: 'A Seven-Figure Logistics Operation — Still Growing',
      description: 'Today, Beard Logistics operates as a seven-figure, veteran-owned logistics company with capabilities spanning freight brokerage, expedited transportation, specialized hauling, ACME terminal operations, cross-docking, warehousing, freight recovery, and chemical distribution. What began with one truck and one trailer has grown into a multi-division operation serving industrial companies, national corporations, government agencies, and customers across the Gulf South and nationwide—with the same commitment to reliability, accountability, and moving freight forward.'
    }
  ];
  timeline.setAttribute('role', 'list');
  timeline.innerHTML = entries.map(entry => `
    <div class="tl-item" role="listitem">
      <div class="tl-dot" aria-hidden="true"></div>
      <div class="tl-year">${entry.year}</div>
      <div class="tl-title">${entry.title}</div>
      <p class="tl-desc">${entry.description}</p>
    </div>`).join('');
})();
</script>`;

  html = html.replace('</body>', timelineScript + '\n</body>');
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.set('cache-control', 'no-cache, no-store, must-revalidate');
  return new Response(html, { status: response.status, headers });
};
