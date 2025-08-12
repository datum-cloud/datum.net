import Lenis from 'lenis';

class LenisParallax {
  constructor() {
    this.lenis = null;
    this.layers = [];
    this.init();
  }

  init() {
    // Initialize Lenis
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Bind RAF
    this.lenis.on('scroll', this.onScroll.bind(this));

    function raf(time) {
      this.lenis.raf(time);
      requestAnimationFrame(raf.bind(this));
    }

    requestAnimationFrame(raf.bind(this));

    // Initialize parallax layers
    this.initLayers();
  }

  initLayers() {
    // Get all parallax layers
    this.layers = document.querySelectorAll('.parallax-layer');

    // Set initial positions
    this.layers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.speed) || 0.5;
      layer.style.transform = `translateY(0px)`;
      layer.dataset.speed = speed;
    });
  }

  onScroll(e) {
    const scrollY = e.scroll;

    // Update each layer with parallax effect
    this.layers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.speed);
      const yPos = -(scrollY * speed);
      layer.style.transform = `translateY(${yPos}px)`;
    });
  }

  // Public method to destroy
  destroy() {
    if (this.lenis) {
      this.lenis.destroy();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.parallaxInstance = new LenisParallax();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.parallaxInstance) {
    window.parallaxInstance.destroy();
  }
});
