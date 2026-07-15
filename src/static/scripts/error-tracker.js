document.addEventListener('astro:page-load', function () {
  const path = window.location.pathname;
  if (window.rybbit) {
    window.rybbit.event('404: ' + path);
  }
});
