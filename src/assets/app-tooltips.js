// ===================================
// Tooltip Module
// Credit: Jaime Paez (https://github.com/jaimepaezv/customTooltip)
// Adapted for accessibility and performance
// ===================================

(function() {
  "use strict";

  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  if (!tooltipElements.length) return;

  // Performance: Single reusable tooltip element
  let tooltipNode = null;
  let currentTrigger = null;
  let hideTimeout = null;
  let uniqueIdCounter = Math.floor(Math.random() * 1000);

  // Performance: Cache touch detection (runs once, not on every event)
  const IS_TOUCH_DEVICE = ('ontouchstart' in window) ||
                          (navigator.maxTouchPoints > 0) ||
                          (navigator.msMaxTouchPoints > 0);

  // Initialize ARIA attributes
  tooltipElements.forEach(element => {
    if (!element.id) {
      element.id = `tooltip-trigger-${uniqueIdCounter++}`;
    }

    // Ensure keyboard accessibility
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
  });

  // Event delegation for performance
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);
  document.addEventListener('focusin', handleFocusIn);
  document.addEventListener('focusout', handleFocusOut);
  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKeyDown);

  function handleMouseOver(e) {
    const trigger = e.target.closest('[data-tooltip]');
    if (!trigger || IS_TOUCH_DEVICE) return;

    clearTimeout(hideTimeout);
    showTooltip(trigger);
  }

  function handleMouseOut(e) {
    const trigger = e.target.closest('[data-tooltip]');
    if (!trigger || IS_TOUCH_DEVICE) return;

    hideTimeout = setTimeout(() => hideTooltip(), 100);
  }

  function handleFocusIn(e) {
    const trigger = e.target.closest('[data-tooltip]');
    if (!trigger) return;

    clearTimeout(hideTimeout);
    showTooltip(trigger);
  }

  function handleFocusOut(e) {
    const trigger = e.target.closest('[data-tooltip]');
    if (!trigger) return;

    hideTimeout = setTimeout(() => hideTooltip(), 100);
  }

  function handleClick(e) {
    const trigger = e.target.closest('[data-tooltip]');

    // Touch devices: toggle on tap
    if (trigger && IS_TOUCH_DEVICE) {
      if (currentTrigger === trigger && isTooltipVisible()) {
        hideTooltip();
      } else {
        showTooltip(trigger);
      }
      return;
    }

    // Click outside: hide
    if (!trigger && isTooltipVisible()) {
      hideTooltip();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape' && isTooltipVisible()) {
      hideTooltip();
      if (currentTrigger) {
        currentTrigger.focus();
      }
    }
  }

  function showTooltip(trigger) {
    const tooltipText = trigger.getAttribute('data-tooltip');
    if (!tooltipText) return;

    // Lazy creation
    if (!tooltipNode) {
      tooltipNode = createTooltip();
      document.body.appendChild(tooltipNode);
    }

    tooltipNode.textContent = tooltipText;
    tooltipNode.id = `${trigger.id}-tooltip`;
    trigger.setAttribute('aria-describedby', tooltipNode.id);

    currentTrigger = trigger;
    positionTooltip(tooltipNode, trigger);

    requestAnimationFrame(() => {
      tooltipNode.classList.add('tooltip-visible');
    });
  }

  function hideTooltip() {
    if (!tooltipNode || !isTooltipVisible()) return;

    tooltipNode.classList.remove('tooltip-visible');

    if (currentTrigger) {
      currentTrigger.removeAttribute('aria-describedby');
      currentTrigger = null;
    }
  }

  function isTooltipVisible() {
    return tooltipNode && tooltipNode.classList.contains('tooltip-visible');
  }

  function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    return tooltip;
  }

  function positionTooltip(tooltip, element) {
    const elementRect = element.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipRect = tooltip.getBoundingClientRect();
    const gap = 10;

    let top = elementRect.top + scrollY - tooltipRect.height - gap;
    let left = elementRect.left + scrollX + (elementRect.width / 2) - (tooltipRect.width / 2);

    // Calculate icon center position
    const iconCenter = elementRect.left + scrollX + (elementRect.width / 2);

    // Horizontal bounds
    if (left < gap) {
      left = gap;
    } else if (left + tooltipRect.width + gap > viewportWidth) {
      left = viewportWidth - tooltipRect.width - gap;
    }

    // Calculate arrow position as percentage relative to tooltip
    const arrowPosition = ((iconCenter - left) / tooltipRect.width) * 100;

    // Clamp arrow position to keep it within tooltip bounds (with padding)
    const minArrow = 10; // 10% from left edge
    const maxArrow = 90; // 10% from right edge
    const clampedArrowPosition = Math.max(minArrow, Math.min(maxArrow, arrowPosition));

    // Set CSS custom property for arrow position
    tooltip.style.setProperty('--arrow-position', `${clampedArrowPosition}%`);

    // Vertical bounds - flip below if needed
    if (top < scrollY + gap) {
      top = elementRect.bottom + scrollY + gap;

      if (top + tooltipRect.height > scrollY + viewportHeight - gap) {
        top = scrollY + gap;
      }
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

})();
