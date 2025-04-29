/******/ (() => { // webpackBootstrap
if (!customElements.get('theme-modal')) {
  class ThemeModal extends HTMLElement {
    constructor() {
      super();
      this.cacheDOMElements();
      this.bindEventHandlers();
    }

    cacheDOMElements() {
      this.sectionId = this.getAttribute('data-section-id');
      this.blockId = this.getAttribute('data-block-id');
      this.modalButton = this.querySelector('[data-modal-button]');
      this.modalTemplate = this.querySelector('template');
      this.overlay = document.querySelector('#DrawerOverlay');
      if (!this.modalButton || !this.modalTemplate) return;
    }

    bindEventHandlers() {
      this.showModal = this.showModal.bind(this);
      this.hideModal = this.hideModal.bind(this);
      this.handleKeydown = this.handleKeydown.bind(this);
    }

    connectedCallback() {
      // Show modal when button is clicked
      this.modalButton.addEventListener('click', this.showModal);

      // Hide modal when overlay is clicked
      if (this.overlay) this.overlay.addEventListener('click', this.hideModal);
    }

    disconnectedCallback() {
      // Clean up event listeners
      this.modalButton.removeEventListener('click', this.showModal);
      if (this.overlay) this.overlay.removeEventListener('click', this.hideModal);
      if (this.dismissButton) this.dismissButton.removeEventListener('click', this.hideModal);
    }

    render() {
      // Render the modal content
      const modalContent = document.querySelector('#ThemeModal');
      if (!modalContent) return;
      modalContent.innerHTML = this.modalTemplate.innerHTML;

      this.modalContent = modalContent;
      this.dismissButton = this.modalContent.querySelector('[data-close]');
      if (this.dismissButton) this.dismissButton.addEventListener('click', this.hideModal);
    }

    showModal() {
      // Show the modal
      this.render();
      document.body.classList.add('theme-modal-open');
      if (this.modalContent) this.modalContent.classList.remove('hidden');
      this.trapFocus();
    }

    hideModal() {
      // Hide the modal
      document.body.classList.remove('theme-modal-open');

      if (this.modalContent) {
        this.modalContent.classList.add('hidden');
        // Clear the modal content to prevent it from being shown when the modal is opened again
        this.modalContent.innerHTML = '';
      }

      // Return focus to the modal button
      this.modalButton.focus();
      document.removeEventListener('keydown', this.handleKeydown);
    }

    trapFocus() {
      const focusableElements = this.modalContent.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
      const firstElement = focusableElements[0];

      // Trap focus inside the modal
      document.addEventListener('keydown', this.handleKeydown);
      firstElement.focus();
    }

    handleKeydown(event) {
      const focusableElements = this.modalContent.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const isTabPressed = (event.key === 'Tab' || event.keyCode === 9);
      if (!isTabPressed) {
        return;
      }

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    }
  }

  customElements.define('theme-modal', ThemeModal);
}

/******/ })()
;