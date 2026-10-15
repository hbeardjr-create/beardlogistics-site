(() => {
  const p = new URLSearchParams(window.location.search);
  const context = ['interest','utm_campaign','campaign','service','category'].map(k => p.get(k) || '').join(' ');
  if (/car[\s_-]?wash|dealership|auto[\s_-]?detail/i.test(context)) {
    window.location.replace('/car-wash-chemicals' + window.location.search + window.location.hash);
  }
})();