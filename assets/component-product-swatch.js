/******/ (() => { // webpackBootstrap
/* eslint-disable */
class ProductSwatch extends HTMLElement {
  constructor() {
    super();

    /* ===== Bind the event handlers in order to maintain the correct context of 'this' ===== */
    this.onSwatchChangeBound = this.onSwatchChange.bind(this);
    this.onColorSwatchMouseEnterBound = this.onColorSwatchMouseEnter.bind(this);
    this.onSwatchMouseLeaveBound = this.onSwatchMouseLeave.bind(this);
  }

  connectedCallback() {
    this.colorLabel = this.querySelector('[data-color-swatch-name]');
    this.colorLabelState = this.querySelector('[data-color-swatch-state]');
    this.soldOutString = this.getAttribute('data-swatch-sold-out-string');
    this.colorSwatches = this.querySelectorAll('.swatch-element.color');
    this.sectionId = this.getAttribute('data-section-id');
    this.setEventListeners();
    this.setColorLabelState();
  }

  setEventListeners() {
    /* ===== Attach the event listeners to the DOM elements ===== */
    this.colorSwatches.forEach(swatch => {
      swatch.addEventListener('mouseenter', this.onColorSwatchMouseEnterBound);
      swatch.addEventListener('mouseleave', this.onSwatchMouseLeaveBound);
    });

    this.addEventListener('change', this.onSwatchChangeBound);
  }

  setColorLabelState() {
    /* ===== Set the color label state based on the active swatch ===== */
    const activeSwatch = this.querySelector('.swatch-element.color.active');
    if (!activeSwatch) return;

    const activeSwatchAvailable = activeSwatch.getAttribute('data-swatch-option-available');
    if (!this.soldOutString || !this.colorLabelState) return;

    // Set color label state (sold out or not)
    this.updateColorLabelState(activeSwatchAvailable);
  }

  updateColorLabelState(available) {
    /* ===== Set the color label state (sold out or not) ===== */
    if (this.colorLabelState) {
      this.colorLabelState.innerText = available === 'false' ? `(${this.soldOutString})` : '';
    }
  }




onSwatchChange(event) {
    const input = event.target;
    const selectedOption = input.getAttribute('data-option'); // Detect if it's color or size

    console.log("Swatch Changed:", selectedOption, "Value:", input.value);

    // Get all selected options
    let selectedColor = null;
    let selectedSize = null;
    let isLinkedProduct = false;

    // Check if this is a linked product
    if (input.hasAttribute("data-product-fetch-url")) {
        isLinkedProduct = true;
    }

    // Get currently selected color
    const colorInput = document.querySelector('.swatch-element.color input:checked');
    if (colorInput) {
        selectedColor = colorInput.value;
    }

    // Get currently selected size
    const sizeInput = document.querySelector('.swatch-element.variant-swatch input:checked');
    if (sizeInput) {
        selectedSize = sizeInput.value;
    }

    console.log("Selected Color:", selectedColor);
    console.log("Selected Size:", selectedSize);
    console.log("Is Linked Product:", isLinkedProduct);

    // **Case 1: Linked Products (Color switches to a different product)**
    if (isLinkedProduct) {
        console.log("Switching product via URL...");
        const newProductUrl = input.getAttribute('data-product-fetch-url');

        if (newProductUrl) {
            window.location.href = newProductUrl; // Keep reload for linked products
        } else {
            console.error("No product URL found for linked product!");
        }
        return;
    }

    // **Case 2: Regular Product with Color & Size Variants (Prevent Reload)**
    let matchedVariant = null;
    const variantDataElements = document.querySelectorAll('script[data-resource]');

    variantDataElements.forEach(script => {
        let variantData = JSON.parse(script.textContent);

        if (
            variantData.option1 === selectedColor &&
            variantData.option2 === selectedSize
        ) {
            matchedVariant = variantData;
        }
    });

    if (!matchedVariant) {
        console.error("No matching variant found! Defaulting to first available.");
        return;
    }

    console.log("Matched Variant:", matchedVariant);

    // 🔥 Update Shopify's form input field (this is where Shopify selects the variant)
    const variantInput = document.querySelector('[name="id"]');
    if (variantInput) {
        variantInput.value = matchedVariant.id;

        // 🔥 Fire a synthetic 'change' event to ensure Shopify registers the update
        let event = new Event('change', { bubbles: true });
        variantInput.dispatchEvent(event);
    } else {
        console.error("Variant input field not found!");
    }

    // 🔥 Ensure the 'Add to Cart' button updates correctly
    const addToCartButton = document.querySelector('form[action*="/cart/add"] button[type="submit"]');
    if (addToCartButton) {
        addToCartButton.setAttribute("data-variant-id", matchedVariant.id);
    }

    // 🔥 Manually update Shopify's internal variant selection
    const productForm = document.querySelector('form[action*="/cart/add"]');
    if (productForm) {
        productForm.dataset.variantId = matchedVariant.id;
    }

    // 🔥 Update the variant selector UI
    const variantDropdown = document.querySelector('select[name="id"]');
    if (variantDropdown) {
        variantDropdown.value = matchedVariant.id;
        variantDropdown.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 🔥 Update Shopify's state in URL without reloading
    history.replaceState(null, null, `?variant=${matchedVariant.id}`);

    // 🔥 Debugging: Confirm the hidden input is correct before form submission
    console.log("Hidden Input Updated:", document.querySelector('[name="id"]').value);
}











  emitVariantChangeEvent(variant, productFetchUrl, productUrl, isCombinedListing = false) {
    /* ===== Emit the variant:change event ===== */
    eventBus.emit('variant:change', {
      sectionId: this.sectionId,
      variant: variant,
      fetchURL: productFetchUrl,
      productURL: productUrl,
      isCombinedListing: isCombinedListing
    });
  }

  onColorSwatchMouseEnter(event) {
    /* ===== Update the color label on mouse enter ===== */
    this.updateColorLabel(event.currentTarget);
    
    // Add sibling hover active class
    const activeSwatch = this.querySelector('.swatch-element.color.active');
    if (activeSwatch && !event.currentTarget.classList.contains('active')) activeSwatch.classList.add('sibling-hover-active');
  }

  onSwatchMouseLeave() {
    /* ===== Reset the color label on mouse leave ===== */
    // Remove sibling hover active class
    const siblingHoverActiveSwatch = this.querySelector('.swatch-element.sibling-hover-active');
    if (siblingHoverActiveSwatch) siblingHoverActiveSwatch.classList.remove('sibling-hover-active');

    // Reset color label
    this.resetColorLabel();
  }

  updateColorLabel = (swatch) => {
    /* ===== Update the color label based on the swatch value ===== */
    if (!swatch) return;
    const label = swatch.getAttribute('data-value');
    const swatchAvailable = swatch.getAttribute('data-swatch-option-available');

    if (!label || !this.colorLabel) return;
    // Set color label text
    this.colorLabel.textContent = label;
    // Set color label state (sold out or not)
    this.updateColorLabelState(swatchAvailable);
  }

  resetColorLabel = () => {
    /* ===== Reset the color label to the active swatch value ===== */
    const activeSwatch = this.querySelector('.swatch-element.color.active');
    if (!activeSwatch || !this.colorLabel) return;

    const activeSwatchValue = activeSwatch.getAttribute('data-value');
    const swatchAvailable = activeSwatch.getAttribute('data-swatch-option-available');
    if (!activeSwatchValue) return;

    // Reset color label text
    this.colorLabel.textContent = activeSwatchValue;
    // Reset color label state (sold out or not)
    this.updateColorLabelState(swatchAvailable);
  }	

  removeEventListeners() {
    /* ===== Remove the event listeners from the DOM elements ===== */
    this.colorSwatches.forEach(swatch => {
      swatch.removeEventListener('mouseenter', this.onColorSwatchMouseEnterBound);
      swatch.removeEventListener('mouseleave', this.onSwatchMouseLeaveBound);
    });

    this.removeEventListener('change', this.onSwatchChangeBound);
  }

  getVariantData(inputId) {
    const variantDataElement = this.getVariantDataElement(inputId);
    if (!variantDataElement) {
        console.error("Variant JSON not found for:", inputId);
        return null;
    }
    
    let variantData = JSON.parse(variantDataElement.textContent);

    // Check if the variant is correct for both size and color
    if (!variantData || !variantData.id) {
        console.error("Invalid Variant Data:", variantData);
        return null;
    }

    return variantData;
}


  getVariantDataElement(inputId) {
    return this.querySelector(`script[type="application/json"][data-resource="${inputId}"]`);
  }

  disconnectedCallback() {
    /* ===== Remove the event listeners when the element is removed from the DOM ===== */
    this.removeEventListeners();
  }
}

if (!window.customElements.get('product-swatch')) {
  window.customElements.define('product-swatch', ProductSwatch);
}

/******/ })()
;