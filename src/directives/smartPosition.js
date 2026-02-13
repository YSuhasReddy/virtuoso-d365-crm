/**
 * v-smart-position directive
 *
 * Calculates available viewport space and positions an element optimally.
 * Supports modifiers: v-smart-position.bottom (prefer bottom), v-smart-position.top (prefer top)
 *
 * Usage:
 *   <div v-smart-position.bottom="{ referenceEl, margin: 8 }">...</div>
 *
 * The binding value should be an object:
 *   - referenceEl: HTMLElement (the trigger/anchor element)
 *   - margin: Number (spacing in px, default 4)
 *   - align: 'left' | 'right' | 'auto' (horizontal alignment, default 'auto')
 */

function debounce(fn, delay) {
  let timer = null
  return function () {
    const context = this
    const args = arguments
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}

function calculatePosition(el, binding) {
  const value = binding.value || {}
  const referenceEl = value.referenceEl
  const margin = value.margin != null ? value.margin : 4
  const alignPref = value.align || 'auto'

  if (!referenceEl) return

  const refRect = referenceEl.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const viewportW = window.innerWidth
  const viewportH = window.innerHeight

  // Determine preferred vertical direction from modifiers
  let preferBottom = true // default
  if (binding.modifiers && binding.modifiers.top) {
    preferBottom = false
  }
  if (binding.modifiers && binding.modifiers.bottom) {
    preferBottom = true
  }

  // Vertical positioning
  const spaceBelow = viewportH - refRect.bottom - margin
  const spaceAbove = refRect.top - margin
  const elHeight = elRect.height || el.scrollHeight || 0

  let top
  let openDirection

  if (preferBottom) {
    if (spaceBelow >= elHeight) {
      top = refRect.bottom + margin
      openDirection = 'below'
    } else if (spaceAbove >= elHeight) {
      top = refRect.top - elHeight - margin
      openDirection = 'above'
    } else {
      // Not enough space either way, choose the bigger side
      if (spaceBelow >= spaceAbove) {
        top = refRect.bottom + margin
        openDirection = 'below'
      } else {
        top = refRect.top - elHeight - margin
        openDirection = 'above'
      }
    }
  } else {
    // preferTop
    if (spaceAbove >= elHeight) {
      top = refRect.top - elHeight - margin
      openDirection = 'above'
    } else if (spaceBelow >= elHeight) {
      top = refRect.bottom + margin
      openDirection = 'below'
    } else {
      if (spaceAbove >= spaceBelow) {
        top = refRect.top - elHeight - margin
        openDirection = 'above'
      } else {
        top = refRect.bottom + margin
        openDirection = 'below'
      }
    }
  }

  // Horizontal positioning
  let left
  const elWidth = elRect.width || el.scrollWidth || 0

  if (alignPref === 'left' || alignPref === 'auto') {
    left = refRect.left
    // If it overflows right, flip
    if (left + elWidth > viewportW - margin) {
      left = refRect.right - elWidth
    }
  } else if (alignPref === 'right') {
    left = refRect.right - elWidth
    // If it overflows left, flip
    if (left < margin) {
      left = refRect.left
    }
  }

  // Clamp to viewport
  if (left < margin) left = margin
  if (left + elWidth > viewportW - margin) left = viewportW - elWidth - margin
  if (top < margin) top = margin

  el.style.position = 'fixed'
  el.style.top = top + 'px'
  el.style.left = left + 'px'
  el.style.zIndex = '9999'

  // Set data attribute for direction awareness
  el.setAttribute('data-smart-position', openDirection)
}

const smartPositionDirective = {
  beforeMount: function (el, binding) {
    // Store handlers for cleanup
    var debouncedCalc = debounce(function () {
      calculatePosition(el, binding)
    }, 16)

    el._smartPositionHandlers = {
      resize: debouncedCalc,
      scroll: debouncedCalc
    }

    window.addEventListener('resize', el._smartPositionHandlers.resize)
    window.addEventListener('scroll', el._smartPositionHandlers.scroll, true)
  },

  mounted: function (el, binding) {
    // Calculate once element is in DOM
    calculatePosition(el, binding)
  },

  updated: function (el, binding) {
    calculatePosition(el, binding)
  },

  unmounted: function (el) {
    if (el._smartPositionHandlers) {
      window.removeEventListener('resize', el._smartPositionHandlers.resize)
      window.removeEventListener('scroll', el._smartPositionHandlers.scroll, true)
      delete el._smartPositionHandlers
    }
  }
}

var SmartPositionPlugin = {
  install: function (app) {
    app.directive('smart-position', smartPositionDirective)
  }
}

export { smartPositionDirective, calculatePosition, debounce }
export default SmartPositionPlugin
