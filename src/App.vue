<template>
  <div id="app" class="d365-app">
    <template v-if="isAuthenticated">
      <!-- Top Header -->
      <AppHeader @toggle-nav="toggleNav" />

      <div class="app-body">
        <!-- Side Navigation -->
        <SideNav :collapsed="sideNavCollapsed" @toggle="toggleNav" />

        <!-- Main Content Area -->
        <main class="main-content" :class="{ 'nav-collapsed': sideNavCollapsed }">
          <router-view />
        </main>
      </div>

      <!-- Quick Create Panel -->
      <QuickCreate
        :show="quickCreateOpen"
        :initial-type="quickCreateType"
        @close="closeQuickCreate"
      />

    </template>

    <template v-else>
      <router-view />
    </template>

    <!-- Alert Container (always visible, including login page) -->
    <AlertContainer />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AppHeader from './components/layout/AppHeader.vue'
import SideNav from './components/layout/SideNav.vue'
import AlertContainer from './components/common/AlertContainer.vue'
import QuickCreate from './components/common/QuickCreate.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    SideNav,
    AlertContainer,
    QuickCreate
  },
  computed: {
    ...mapGetters('ui', ['sideNavCollapsed', 'quickCreateOpen', 'quickCreateType']),
    isAuthenticated() {
      return this.$store.getters['auth/isAuthenticated']
    }
  },
  methods: {
    ...mapActions('ui', ['toggleSideNav', 'closeQuickCreate']),
    toggleNav() {
      this.toggleSideNav()
    }
  },
  created() {
    // Initialize auth module first
    this.$store.dispatch('auth/initAuth')

    // Initialize all store modules from localStorage
    this.$store.dispatch('contacts/initContacts')
    this.$store.dispatch('opportunities/initOpportunities')
    this.$store.dispatch('activities/initActivities')
    this.$store.dispatch('sales/initSales')
    this.$store.dispatch('items/initItems')
    this.$store.dispatch('campaigns/initCampaigns')
    this.$store.dispatch('salespersons/initSalespersons')
  }
}
</script>

<style>
.d365-app {
  min-height: 100vh;
  background: #F3F2F1;
}

.app-body {
  display: flex;
  padding-top: 48px; /* Header height */
}

.main-content {
  flex: 1;
  margin-left: 220px;
  min-height: calc(100vh - 48px);
  transition: margin-left 0.2s ease;
}
.main-content.nav-collapsed {
  margin-left: 48px;
}
</style>
