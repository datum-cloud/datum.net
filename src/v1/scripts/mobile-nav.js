/**
 * Mobile Navigation JavaScript
 * Handles burger menu, drawer functionality, and mobile navigation
 */

class MobileNavigation {
  constructor() {
    this.mobileMenuButton = document.getElementById('mobile-menu-button');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    this.burgerIcon = document.getElementById('burger-icon');

    this.isOpen = false;

    this.init();
  }

  init() {
    if (!this.mobileMenuButton || !this.mobileMenu) {
      console.warn('Mobile navigation elements not found');
      return;
    }

    this.bindEvents();
  }

  bindEvents() {
    // Burger menu button click
    this.mobileMenuButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMenu();
    });

    // Overlay click to close
    if (this.mobileMenuOverlay) {
      this.mobileMenuOverlay.addEventListener('click', () => {
        this.closeMenu();
      });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
      }
    });

    // Close menu when clicking on navigation links
    const mobileNavLinks = this.mobileMenu.querySelectorAll('a');
    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && this.isOpen) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.isOpen = true;

    // Update aria-expanded
    this.mobileMenuButton.setAttribute('aria-expanded', 'true');

    // Show overlay
    this.mobileMenuOverlay?.classList.remove('hidden');

    // Show and animate drawer
    this.mobileMenu.classList.remove('-translate-x-full');

    // Disable body scroll more aggressively
    const scrollY = window.scrollY;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.classList.add('mobile-menu-open');

    // Focus management
    this.mobileMenu.focus();
  }

  closeMenu() {
    this.isOpen = false;

    // Update aria-expanded
    this.mobileMenuButton.setAttribute('aria-expanded', 'false');

    // Hide overlay
    this.mobileMenuOverlay?.classList.add('hidden');

    // Hide drawer
    this.mobileMenu.classList.add('-translate-x-full');

    // Restore body scroll
    const scrollY = document.body.style.top;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.classList.remove('mobile-menu-open');
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MobileNavigation();
});

// Handle page navigation (for SPA-like behavior)
document.addEventListener('astro:page-load', () => {
  new MobileNavigation();
});
