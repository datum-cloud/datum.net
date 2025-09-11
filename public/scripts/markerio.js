// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
window.markerConfig = { project: '68c1c9a105a0955e0d43bd15', source: 'snippet' };
!(function (e, r, a) {
  if (!e.__Marker) {
    e.__Marker = {};
    var t = [],
      n = { __cs: t };
    ([
      'show',
      'hide',
      'isVisible',
      'capture',
      'cancelCapture',
      'unload',
      'reload',
      'isExtensionInstalled',
      'setReporter',
      'clearReporter',
      'setCustomData',
      'on',
      'off',
    ].forEach(function (e) {
      n[e] = function () {
        var r = Array.prototype.slice.call(arguments);
        (r.unshift(e), t.push(r));
      };
    }),
      (e.Marker = n));
    var s = r.createElement('script');
    ((s.async = 1), (s.src = 'https://edge.marker.io/latest/shim.js'));
    var i = r.getElementsByTagName('script')[0];
    i.parentNode.insertBefore(s, i);
  }
})(window, document);
/* eslint-enable */
// @ts-check
