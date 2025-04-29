/******/ (() => { // webpackBootstrap
/* eslint-disable */
if (!customElements.get('quantity-input')) {
  customElements.define('quantity-input', class QuantityInput extends HTMLElement {
    constructor() {
      super();
      this.cacheDOMElements();
      this.bindEventHandlers();
    }

    cacheDOMElements() {
      this.input = this.querySelector('input');
      this.buttonMinus = this.querySelector("button[name='minus']");
      this.buttonPlus = this.querySelector("button[name='plus']");
      this.sectionId = this.getAttribute('data-section-id');
    }

    bindEventHandlers() {
      this.attachEventListeners = this.attachEventListeners.bind(this);
      this.detachEventListeners = this.detachEventListeners.bind(this);
      this.onButtonClick = this.onButtonClick.bind(this);
      this.onInput = this.debounce(this.onInput.bind(this), 500);
      this.onCartAdded = this.onCartAdded.bind(this);
    }

connectedCallback() {
  this.attachEventListeners();

}



    attachEventListeners() {
      this.buttonMinus.addEventListener('click', this.onButtonClick);
      this.buttonPlus.addEventListener('click', this.onButtonClick);
      this.input.addEventListener('input', this.onInput);
      eventBus.on('cart:added', this.onCartAdded);
    }

    debounce(func, wait, immediate) {
      let timeout;
      return function executedFunction() {
        const context = this;
        const args = arguments;
        
        const later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };

        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    }

    onButtonClick(event) {
      event.preventDefault();
      const previousValue = this.input.value;
      const adjustment = event.currentTarget.name === 'plus' ? 1 : -1;

      this.adjustQuantity(adjustment);
      
      if (previousValue !== this.input.value) {
        eventBus.emit('qty:change', { value: this.input.value, sectionId: this.sectionId });
      }

      // Save the new quantity to localStorage
      localStorage.setItem('savedQuantity', this.input.value);
    }

    onInput(event) {
      event.preventDefault();

      if (isNaN(this.input.value)) {
        this.input.value = 1;
      }

      if (this.input.min && parseInt(this.input.value) < parseInt(this.input.min)) {
        this.input.value = this.input.min;
      }

      eventBus.emit('qty:change', { value: this.input.value, sectionId: this.sectionId });

      // Save the new quantity to localStorage
      localStorage.setItem('savedQuantity', this.input.value);
    }

    adjustQuantity(adjustment) {
      const newValue = parseInt(this.input.value) + adjustment;
      this.input.value = isNaN(newValue) ? 1 : newValue;

      if (this.input.min && parseInt(this.input.value) < parseInt(this.input.min)) {
        this.input.value = this.input.min;
      }
    }

   onCartAdded(data) {
  /* ===== Handle the cart:added event and keep the quantity value ===== */
  if (data.sectionId && data.sectionId === this.sectionId) {
    // Optionally store the quantity in localStorage to remember it
    localStorage.setItem('savedQuantity', this.input.value);
  }
}


    disconnectedCallback() {
      this.detachEventListeners();
    }

    detachEventListeners() {
      this.buttonMinus.removeEventListener('click', this.onButtonClick);
      this.buttonPlus.removeEventListener('click', this.onButtonClick);
      this.input.removeEventListener('input', this.onInput);
    }
  });
}

/******/ })()
;