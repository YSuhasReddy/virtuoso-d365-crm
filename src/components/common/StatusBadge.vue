<template>
  <span class="status-badge" :class="badgeClass">{{ label || status }}</span>
</template>

<script>
export default {
  name: 'StatusBadge',
  props: {
    status: { type: String, required: true },
    label: { type: String, default: '' }
  },
  computed: {
    badgeClass() {
      const s = this.status.toLowerCase().replace(/\s+/g, '-')
      const map = {
        'open': 'badge-open',
        'won': 'badge-won',
        'closed-won': 'badge-won',
        'lost': 'badge-lost',
        'closed-lost': 'badge-lost',
        'draft': 'badge-draft',
        'sent': 'badge-sent',
        'accepted': 'badge-accepted',
        'rejected': 'badge-lost',
        'expired': 'badge-cancelled',
        'completed': 'badge-completed',
        'cancelled': 'badge-cancelled',
        'overdue': 'badge-overdue',
        'paid': 'badge-won',
        'unpaid': 'badge-sent',
        'processing': 'badge-open',
        'shipped': 'badge-sent',
        'delivered': 'badge-completed',
        'prospect': 'badge-open',
        'customer': 'badge-won',
        'vendor': 'badge-sent',
        'partner': 'badge-accepted',
        'company': 'badge-open',
        'person': 'badge-sent',
        'high': 'badge-overdue',
        'medium': 'badge-sent',
        'low': 'badge-draft',
        'normal': 'badge-draft',
        'task': 'badge-open',
        'call': 'badge-sent',
        'email': 'badge-accepted',
        'meeting': 'badge-draft',
      }
      return map[s] || 'badge-draft'
    }
  }
}
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 2px;
  white-space: nowrap;
}
</style>
