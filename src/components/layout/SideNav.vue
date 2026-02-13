<template>
  <nav class="side-nav" :class="{ collapsed: collapsed }">
    <div class="nav-content">
      <!-- Navigation Groups -->
      <div v-for="group in navGroups" :key="group.label" class="nav-group">
        <button
          v-if="!collapsed"
          class="nav-group-header"
          @click="toggleGroup(group.label)"
        >
          <span>{{ group.label }}</span>
          <svg
            class="chevron"
            :class="{ rotated: expandedGroups[group.label] }"
            width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
          >
            <path d="M4.5 2l4 4-4 4"/>
          </svg>
        </button>

        <transition name="expand">
          <div v-show="collapsed || expandedGroups[group.label]" class="nav-items">
            <router-link
              v-for="item in group.items"
              :key="item.path"
              :to="item.path"
              class="nav-item"
              :class="{ active: isActive(item) }"
              :title="item.label"
            >
              <span class="nav-icon" v-html="item.icon"></span>
              <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
              <span v-if="!collapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
            </router-link>
          </div>
        </transition>
      </div>
    </div>

    <!-- Collapse Toggle -->
    <button class="nav-collapse-toggle" @click="$emit('toggle')" :title="collapsed ? 'Expand' : 'Collapse'">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" :style="{ transform: collapsed ? 'rotate(180deg)' : '' }">
        <path d="M10.5 3l-5 5 5 5"/>
      </svg>
      <span v-if="!collapsed" class="nav-label">Collapse</span>
    </button>
  </nav>
</template>

<script>
export default {
  name: 'SideNav',
  props: {
    collapsed: { type: Boolean, default: false }
  },
  data() {
    return {
      expandedGroups: {
        'Home': true,
        'My Work': true,
        'Customers': true,
        'Products': true,
        'Sales': true,
        'Marketing': false,
        'Reports': false,
      }
    }
  },
  computed: {
    overdueCount() {
      return this.$store.getters['activities/overdue'] ? this.$store.getters['activities/overdue'].length : 0
    },
    navGroups() {
      return [
        {
          label: 'Home',
          items: [
            { label: 'Dashboard', path: '/dashboard', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>' },
          ]
        },
        {
          label: 'My Work',
          items: [
            { label: 'Activities', path: '/activities', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>', badge: this.overdueCount > 0 ? this.overdueCount : null },
          ]
        },
        {
          label: 'Customers',
          items: [
            { label: 'Contacts', path: '/contacts', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>' },
            { label: 'Salespersons', path: '/salespersons', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>' },
          ]
        },
        {
          label: 'Products',
          items: [
            { label: 'Items', path: '/items', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2L3 7v11h14V7l-7-5zM6 9a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/></svg>' },
          ]
        },
        {
          label: 'Sales',
          items: [
            { label: 'Opportunities', path: '/opportunities', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd"/></svg>' },
            { label: 'Pipeline', path: '/opportunities/pipeline', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>' },
            { label: 'Quotes', path: '/sales/quotes', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/></svg>' },
            { label: 'Orders', path: '/sales/orders', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"/></svg>' },
            { label: 'Invoices', path: '/sales/invoices', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/></svg>' },
          ]
        },
        {
          label: 'Marketing',
          items: [
            { label: 'Campaigns', path: '/campaigns', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clip-rule="evenodd"/></svg>' },
          ]
        },
        {
          label: 'Reports',
          items: [
            { label: 'Sales Analytics', path: '/reports', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/></svg>' },
          ]
        }
      ]
    }
  },
  methods: {
    toggleGroup(label) {
      this.expandedGroups[label] = !this.expandedGroups[label]
    },
    isActive(item) {
      return this.$route.path === item.path || this.$route.path.startsWith(item.path + '/')
    }
  }
}
</script>

<style scoped>
.side-nav {
  display: flex;
  flex-direction: column;
  width: 220px;
  height: calc(100vh - 48px);
  background: #002050;
  color: rgba(255, 255, 255, 0.85);
  position: fixed;
  top: 48px;
  left: 0;
  z-index: 900;
  transition: width 0.2s ease;
  overflow: hidden;
}
.side-nav.collapsed {
  width: 48px;
}

.nav-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;
}
.nav-content::-webkit-scrollbar {
  width: 4px;
}
.nav-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.nav-group {
  margin-bottom: 2px;
}

.nav-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  font-family: inherit;
}
.nav-group-header:hover {
  color: rgba(255, 255, 255, 0.7);
}

.chevron {
  transition: transform 0.2s ease;
}
.chevron.rotated {
  transform: rotate(90deg);
}

.nav-items {
  overflow: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 13px;
  transition: all 0.1s ease;
  border-left: 3px solid transparent;
  white-space: nowrap;
}
.collapsed .nav-item {
  justify-content: center;
  padding: 10px;
  gap: 0;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}
.nav-item.active {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: #0078D4;
  color: white;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.nav-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  background: #D13438;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.nav-collapse-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.1s;
}
.collapsed .nav-collapse-toggle {
  justify-content: center;
  padding: 12px;
}
.nav-collapse-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Expand transition */
.expand-enter-active, .expand-leave-active {
  transition: all 0.2s ease;
  max-height: 500px;
  opacity: 1;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
