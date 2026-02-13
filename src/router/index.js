import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: 'Sign In', public: true }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: 'Dashboard', breadcrumbs: [{ label: 'Dashboard' }] }
  },

  // Contacts
  {
    path: '/contacts',
    name: 'ContactsList',
    component: () => import('../views/contacts/ContactsList.vue'),
    meta: { title: 'Contacts', breadcrumbs: [{ label: 'Contacts' }] }
  },
  {
    path: '/contacts/new',
    name: 'ContactNew',
    component: () => import('../views/contacts/ContactForm.vue'),
    meta: { title: 'New Contact', breadcrumbs: [{ label: 'Contacts', path: '/contacts' }, { label: 'New' }] }
  },
  {
    path: '/contacts/:id',
    name: 'ContactDetail',
    component: () => import('../views/contacts/ContactDetail.vue'),
    meta: { title: 'Contact', breadcrumbs: [{ label: 'Contacts', path: '/contacts' }, { label: 'Details' }] }
  },
  {
    path: '/contacts/:id/edit',
    name: 'ContactEdit',
    component: () => import('../views/contacts/ContactForm.vue'),
    meta: { title: 'Edit Contact', breadcrumbs: [{ label: 'Contacts', path: '/contacts' }, { label: 'Edit' }] }
  },

  // Opportunities
  {
    path: '/opportunities',
    name: 'OpportunitiesList',
    component: () => import('../views/opportunities/OpportunitiesList.vue'),
    meta: { title: 'Opportunities', breadcrumbs: [{ label: 'Opportunities' }] }
  },
  {
    path: '/opportunities/pipeline',
    name: 'Pipeline',
    component: () => import('../views/opportunities/PipelineView.vue'),
    meta: { title: 'Pipeline', breadcrumbs: [{ label: 'Opportunities', path: '/opportunities' }, { label: 'Pipeline' }] }
  },
  {
    path: '/opportunities/new',
    name: 'OpportunityNew',
    component: () => import('../views/opportunities/OpportunityForm.vue'),
    meta: { title: 'New Opportunity', breadcrumbs: [{ label: 'Opportunities', path: '/opportunities' }, { label: 'New' }] }
  },
  {
    path: '/opportunities/:id',
    name: 'OpportunityDetail',
    component: () => import('../views/opportunities/OpportunityDetail.vue'),
    meta: { title: 'Opportunity', breadcrumbs: [{ label: 'Opportunities', path: '/opportunities' }, { label: 'Details' }] }
  },
  {
    path: '/opportunities/:id/edit',
    name: 'OpportunityEdit',
    component: () => import('../views/opportunities/OpportunityForm.vue'),
    meta: { title: 'Edit Opportunity', breadcrumbs: [{ label: 'Opportunities', path: '/opportunities' }, { label: 'Edit' }] }
  },

  // Activities
  {
    path: '/activities',
    name: 'ActivitiesList',
    component: () => import('../views/activities/ActivitiesList.vue'),
    meta: { title: 'Activities', breadcrumbs: [{ label: 'Activities' }] }
  },
  {
    path: '/activities/new',
    name: 'ActivityNew',
    component: () => import('../views/activities/ActivityForm.vue'),
    meta: { title: 'New Activity', breadcrumbs: [{ label: 'Activities', path: '/activities' }, { label: 'New' }] }
  },

  // Sales Documents
  {
    path: '/sales/quotes',
    name: 'QuotesList',
    component: () => import('../views/sales/SalesDocumentsList.vue'),
    meta: { title: 'Sales Quotes', docType: 'Quote', breadcrumbs: [{ label: 'Quotes' }] }
  },
  {
    path: '/sales/orders',
    name: 'OrdersList',
    component: () => import('../views/sales/SalesDocumentsList.vue'),
    meta: { title: 'Sales Orders', docType: 'Order', breadcrumbs: [{ label: 'Orders' }] }
  },
  {
    path: '/sales/invoices',
    name: 'InvoicesList',
    component: () => import('../views/sales/SalesDocumentsList.vue'),
    meta: { title: 'Sales Invoices', docType: 'Invoice', breadcrumbs: [{ label: 'Invoices' }] }
  },
  {
    path: '/sales/:type/new',
    name: 'SalesDocNew',
    component: () => import('../views/sales/SalesDocumentForm.vue'),
    meta: { title: 'New Document', breadcrumbs: [{ label: 'Sales' }, { label: 'New' }] }
  },
  {
    path: '/sales/:type/:id',
    name: 'SalesDocDetail',
    component: () => import('../views/sales/SalesDocumentDetail.vue'),
    meta: { title: 'Document', breadcrumbs: [{ label: 'Sales' }, { label: 'Details' }] }
  },

  // Items / Products
  {
    path: '/items',
    name: 'ItemsList',
    component: () => import('../views/items/ItemsList.vue'),
    meta: { title: 'Items', breadcrumbs: [{ label: 'Items' }] }
  },
  {
    path: '/items/new',
    name: 'ItemNew',
    component: () => import('../views/items/ItemForm.vue'),
    meta: { title: 'New Item', breadcrumbs: [{ label: 'Items', path: '/items' }, { label: 'New' }] }
  },
  {
    path: '/items/:id',
    name: 'ItemDetail',
    component: () => import('../views/items/ItemDetail.vue'),
    meta: { title: 'Item', breadcrumbs: [{ label: 'Items', path: '/items' }, { label: 'Details' }] }
  },
  {
    path: '/items/:id/edit',
    name: 'ItemEdit',
    component: () => import('../views/items/ItemForm.vue'),
    meta: { title: 'Edit Item', breadcrumbs: [{ label: 'Items', path: '/items' }, { label: 'Edit' }] }
  },

  // Campaigns / Marketing
  {
    path: '/campaigns',
    name: 'CampaignsList',
    component: () => import('../views/campaigns/CampaignsList.vue'),
    meta: { title: 'Campaigns', breadcrumbs: [{ label: 'Campaigns' }] }
  },
  {
    path: '/campaigns/new',
    name: 'CampaignNew',
    component: () => import('../views/campaigns/CampaignForm.vue'),
    meta: { title: 'New Campaign', breadcrumbs: [{ label: 'Campaigns', path: '/campaigns' }, { label: 'New' }] }
  },
  {
    path: '/campaigns/:id',
    name: 'CampaignDetail',
    component: () => import('../views/campaigns/CampaignDetail.vue'),
    meta: { title: 'Campaign', breadcrumbs: [{ label: 'Campaigns', path: '/campaigns' }, { label: 'Details' }] }
  },
  {
    path: '/campaigns/:id/edit',
    name: 'CampaignEdit',
    component: () => import('../views/campaigns/CampaignForm.vue'),
    meta: { title: 'Edit Campaign', breadcrumbs: [{ label: 'Campaigns', path: '/campaigns' }, { label: 'Edit' }] }
  },

  // Salespersons
  {
    path: '/salespersons',
    name: 'SalespersonsList',
    component: () => import('../views/salespersons/SalespersonsList.vue'),
    meta: { title: 'Salespersons', breadcrumbs: [{ label: 'Salespersons' }] }
  },
  {
    path: '/salespersons/new',
    name: 'SalespersonNew',
    component: () => import('../views/salespersons/SalespersonForm.vue'),
    meta: { title: 'New Salesperson', breadcrumbs: [{ label: 'Salespersons', path: '/salespersons' }, { label: 'New' }] }
  },
  {
    path: '/salespersons/:id',
    name: 'SalespersonDetail',
    component: () => import('../views/salespersons/SalespersonDetail.vue'),
    meta: { title: 'Salesperson', breadcrumbs: [{ label: 'Salespersons', path: '/salespersons' }, { label: 'Details' }] }
  },
  {
    path: '/salespersons/:id/edit',
    name: 'SalespersonEdit',
    component: () => import('../views/salespersons/SalespersonForm.vue'),
    meta: { title: 'Edit Salesperson', breadcrumbs: [{ label: 'Salespersons', path: '/salespersons' }, { label: 'Edit' }] }
  },

  // Reports
  {
    path: '/reports',
    name: 'SalesReports',
    component: () => import('../views/reports/SalesReports.vue'),
    meta: { title: 'Sales Reports', breadcrumbs: [{ label: 'Reports' }] }
  },

  // Catch-all
  {
    path: '*',
    redirect: '/dashboard'
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { x: 0, y: 0 }
  }
})

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title || 'D365 Sales CRM') + ' - Virtuoso D365 CRM'

  const isAuthenticated = store.getters['auth/isAuthenticated']

  if (!to.meta.public && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
