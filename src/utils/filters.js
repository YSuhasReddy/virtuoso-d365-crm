/**
 * Global filter functions extracted from Vue.filter() calls.
 * Vue 3 removed the pipe syntax {{ val | filter }}.
 * These are registered as app.config.globalProperties.$filters.
 */

export function currency(value) {
  if (value === null || value === undefined) return '$0.00'
  return `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function date(value) {
  if (!value) return ''
  const d = new Date(value)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function shortDate(value) {
  if (!value) return ''
  const d = new Date(value)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default { currency, date, shortDate }
