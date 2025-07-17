/**
 * Mobile Navigation JavaScript
 * Handles burger menu, drawer functionality, and mobile dropdowns
 */

class MobileNavigation {
  constructor() {
    this.mobileMenuButton = document.getElementById('mobile-menu-button');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    this.mobileMenuClose = document.getElementById('mobile-menu-close');
    this.burgerIcon = document.getElementById('burger-icon');
    this.closeIcon = document.getElementById('close-icon');

    this.isOpen = false;

    this.init();
  }

  init() {
    if (!this.mobileMenuButton || !this.mobileMenu) {
      console.warn('Mobile navigation elements not found');
      return;
    }

    this.bindEvents();
    this.initMobileDropdowns();
  }

  bindEvents() {
    // Burger menu button click
    this.mobileMenuButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMenu();
    });

    // Close button click
    if (this.mobileMenuClose) {
      this.mobileMenuClose.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeMenu();
      });
    }

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
    const mobileNavLinks = this.mobileMenu.querySelectorAll('a:not(.mobile-dropdown-trigger)');
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

    // Update button icons
    this.burgerIcon?.classList.add('hidden');
    this.closeIcon?.classList.remove('hidden');

    // Update aria-expanded
    this.mobileMenuButton.setAttribute('aria-expanded', 'true');

    // Show overlay
    this.mobileMenuOverlay?.classList.remove('hidden');

    // Show and animate drawer
    this.mobileMenu.classList.remove('translate-x-full');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus management
    this.mobileMenu.focus();
  }

  closeMenu() {
    this.isOpen = false;

    // Update button icons
    this.burgerIcon?.classList.remove('hidden');
    this.closeIcon?.classList.add('hidden');

    // Update aria-expanded
    this.mobileMenuButton.setAttribute('aria-expanded', 'false');

    // Hide overlay
    this.mobileMenuOverlay?.classList.add('hidden');

    // Hide drawer
    this.mobileMenu.classList.add('translate-x-full');

    // Restore body scroll
    document.body.style.overflow = '';

    // Close all mobile dropdowns
    this.closeAllDropdowns();
  }

  initMobileDropdowns() {
    const dropdownTriggers = this.mobileMenu.querySelectorAll('.mobile-dropdown-trigger');

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMobileDropdown(trigger);
      });
    });
  }

  toggleMobileDropdown(trigger) {
    const dropdown = trigger.closest('.mobile-dropdown');
    const content = dropdown.querySelector('.mobile-dropdown-content');
    const icon = trigger.querySelector('.mobile-dropdown-icon');
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      // Close this dropdown
      content.classList.add('hidden');
      icon.classList.remove('rotate-180');
      trigger.setAttribute('aria-expanded', 'false');
    } else {
      // Close all other dropdowns first
      this.closeAllDropdowns();

      // Open this dropdown
      content.classList.remove('hidden');
      icon.classList.add('rotate-180');
      trigger.setAttribute('aria-expanded', 'true');
    }
  }

  closeAllDropdowns() {
    const dropdowns = this.mobileMenu.querySelectorAll('.mobile-dropdown');

    dropdowns.forEach((dropdown) => {
      const trigger = dropdown.querySelector('.mobile-dropdown-trigger');
      const content = dropdown.querySelector('.mobile-dropdown-content');
      const icon = trigger.querySelector('.mobile-dropdown-icon');

      content.classList.add('hidden');
      icon.classList.remove('rotate-180');
      trigger.setAttribute('aria-expanded', 'false');
    });
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
