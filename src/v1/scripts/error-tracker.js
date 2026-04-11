document.addEventListener('astro:page-load', function () {
  const path = window.location.pathname;
  if (window.fathom) {
    window.fathom.trackEvent('404: ' + path);
  }
});
