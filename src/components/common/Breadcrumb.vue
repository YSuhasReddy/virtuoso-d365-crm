<template>
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol class="breadcrumb-list">
      <li v-for="(crumb, index) in crumbs" :key="index" class="breadcrumb-item">
        <router-link
          v-if="crumb.path && index < crumbs.length - 1"
          :to="crumb.path"
          class="breadcrumb-link"
        >{{ crumb.label }}</router-link>
        <span v-else class="breadcrumb-current">{{ crumb.label }}</span>
        <svg v-if="index < crumbs.length - 1" class="breadcrumb-sep" width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
          <path d="M2.5 1l3 3-3 3"/>
        </svg>
      </li>
    </ol>
  </nav>
</template>

<script>
export default {
  name: 'Breadcrumb',
  props: {
    items: { type: Array, default: () => [] }
  },
  computed: {
    crumbs() {
      if (this.items.length > 0) return this.items
      const route = this.$route
      const crumbs = [{ label: 'Home', path: '/dashboard' }]
      if (route.meta && route.meta.breadcrumbs) {
        return [...crumbs, ...route.meta.breadcrumbs]
      }
      if (route.name) {
        crumbs.push({ label: route.meta.title || route.name })
      }
      return crumbs
    }
  }
}
</script>

<style scoped>
.breadcrumb {
  padding: 8px 0;
}
.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 4px;
}
.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.breadcrumb-link {
  color: #0078D4;
  text-decoration: none;
  font-size: 13px;
}
.breadcrumb-link:hover {
  text-decoration: underline;
}
.breadcrumb-current {
  color: #323130;
  font-size: 13px;
  font-weight: 600;
}
.breadcrumb-sep {
  color: #A19F9D;
}
</style>
