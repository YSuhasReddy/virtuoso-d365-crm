<template>
  <div class="contact-detail-view">
    <!-- Breadcrumb -->
    <div class="px-4 pt-3">
      <Breadcrumb :items="breadcrumbs" />
    </div>

    <!-- Loading / Not Found -->
    <div v-if="!contact" class="empty-state px-4 py-12 text-center">
      <p class="text-lg font-semibold text-gray-700">Contact not found</p>
      <p class="text-sm text-gray-500 mt-1">The contact you are looking for does not exist or has been deleted.</p>
      <button class="d365-cmd-btn primary mt-4" @click="$router.push('/contacts')">Back to Contacts</button>
    </div>

    <template v-if="contact">
      <!-- Header Section -->
      <div class="detail-header px-4 pb-2">
        <div class="header-left">
          <button class="back-btn" @click="$router.push('/contacts')" title="Back to Contacts">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11 2L5 8l6 6" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
          </button>
          <div class="header-info">
            <h1 class="contact-name">{{ contact.name }}</h1>
            <div class="header-badges">
              <StatusBadge :status="contact.type" />
              <StatusBadge :status="contact.businessRelation" />
              <span v-if="contact.jobTitle" class="job-title-text">{{ contact.jobTitle }}</span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <RecordNavigation
            :current-index="currentContactIndex"
            :total-count="allContacts.length"
            entity-name="Contact"
            @navigate="handleRecordNav"
          />
        </div>
      </div>

      <!-- Command Bar -->
      <CommandBar
        :actions="commandActions"
        :show-view-switcher="false"
        :show-filter="false"
        @edit="goToEdit"
        @delete="showDeleteDialog = true"
        @new-activity="goToNewActivity"
        @new-quote="goToNewQuote"
      />

      <!-- Tab Bar -->
      <div class="d365-tabs px-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="d365-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="tab-count">({{ tab.count }})</span>
        </button>
      </div>

      <!-- Detail Layout: main content + FactBox -->
      <div class="detail-layout">
        <div class="detail-main" :class="{ 'factbox-open': !factBoxCollapsed }">
          <!-- Tab Content -->
          <div class="tab-content px-4 pb-4">

            <!-- General Tab -->
            <div v-if="activeTab === 'general'" class="general-tab">
              <div class="detail-grid">
                <!-- Left Column -->
                <div class="detail-column">
                  <div class="section-card d365-card">
                    <div class="section-header">Contact Information</div>
                    <div class="section-body">
                      <div class="detail-field">
                        <span class="field-label">Name</span>
                        <span class="field-value">{{ contact.name }}</span>
                      </div>
                      <div v-if="contact.type === 'Person'" class="detail-field">
                        <span class="field-label">First Name</span>
                        <span class="field-value">{{ contact.firstName }}</span>
                      </div>
                      <div v-if="contact.type === 'Person'" class="detail-field">
                        <span class="field-label">Last Name</span>
                        <span class="field-value">{{ contact.lastName }}</span>
                      </div>
                      <div class="detail-field">
                        <span class="field-label">Type</span>
                        <span class="field-value"><StatusBadge :status="contact.type" /></span>
                      </div>
                      <div class="detail-field">
                        <span class="field-label">Email</span>
                        <span class="field-value">
                          <a v-if="contact.email" :href="'mailto:' + contact.email" class="field-link">{{ contact.email }}</a>
                          <span v-else class="field-empty">--</span>
                        </span>
                      </div>
                      <div class="detail-field">
                        <span class="field-label">Phone</span>
                        <span class="field-value">{{ contact.phone || '--' }}</span>
                      </div>
                      <div class="detail-field">
                        <span class="field-label">Mobile</span>
                        <span class="field-value">{{ contact.mobile || '--' }}</span>
                      </div>
                      <div v-if="contact.website" class="detail-field">
                        <span class="field-label">Website</span>
                        <span class="field-value">
                          <a :href="contact.website" target="_blank" rel="noopener" class="field-link">{{ contact.website }}</a>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div v-if="contact.type === 'Person'" class="section-card d365-card mt-3">
                    <div class="section-header">Professional</div>
                    <div class="section-body">
                      <div class="detail-field">
                        <span class="field-label">Job Title</span>
                        <span class="field-value">{{ contact.jobTitle || '--' }}</span>
                      </div>
                      <div class="detail-field">
                        <span class="field-label">Department</span>
                        <span class="field-value">{{ contact.department || '--' }}</span>
                      </div>
                      <div class="detail-field">
                        <span class="field-label">Company</span>
                        <span class="field-value">
                          <router-link v-if="parentCompany" :to="'/contacts/' + parentCompany.id" class="field-link">{{ parentCompany.name }}</router-link>
                          <span v-else class="field-empty">--</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right Column -->
                <div class="detail-column">
                  <div class="section-card d365-card">
                    <div class="section-header">Address</div>
                    <div class="section-body">
                      <div class="detail-field">
                        <span class="field-label">Address</span>
                        <span class="field-value">{{ contact.address ? contact.address.line1 : '--' }}</span>
                      </div>
                      <div class="detail-field">
                        <span class="field-label">City</span>
                        <span class="field-value">{{ contact.address ? contact.address.city : '--' }}</span>
                      </div>
                      <div class="detail-field">
                        <span class="field-label">State</span>
                        <span class="field-value">{{ contact.address ? contact.address.state : '--' }}</span>
                      </div>
                      <div class="detail-field">
                        <span class="field-label">Postal Code</span>
                        <span class="field-value">{{ contact.address ? contact.address.postalCode : '--' }}</span>
                      </div>
                      <div class="detail-field">
                        <span class="field-label">Country</span>
                        <span class="field-value">{{ contact.address ? contact.address.country : '--' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="section-card d365-card mt-3">
                    <div class="section-header">Business Details</div>
                    <div class="section-body">
                      <div class="detail-field">
                        <span class="field-label">Business Relation</span>
                        <span class="field-value"><StatusBadge :status="contact.businessRelation" /></span>
                      </div>
                      <div class="detail-field">
                        <span class="field-label">Industry</span>
                        <span class="field-value">{{ contact.industry || '--' }}</span>
                      </div>
                      <div class="detail-field">
                        <span class="field-label">Salesperson</span>
                        <span class="field-value">{{ getSalespersonName(contact.salesperson) }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="contact.notes" class="section-card d365-card mt-3">
                    <div class="section-header">Notes</div>
                    <div class="section-body">
                      <p class="notes-text">{{ contact.notes }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Opportunities Tab -->
            <div v-if="activeTab === 'opportunities'" class="opportunities-tab">
              <div v-if="contactOpportunities.length === 0" class="empty-tab-state">
                <p class="empty-title">No opportunities</p>
                <p class="empty-subtitle">There are no opportunities linked to this contact.</p>
              </div>
              <div v-else class="opp-list">
                <div
                  v-for="opp in contactOpportunities"
                  :key="opp.id"
                  class="opp-card d365-card"
                  @click="$router.push('/opportunities/' + opp.id)"
                >
                  <div class="opp-card-header">
                    <span class="opp-name">{{ opp.name }}</span>
                    <StatusBadge :status="opp.status" />
                  </div>
                  <div class="opp-card-body">
                    <div class="opp-meta">
                      <span class="opp-meta-item">
                        <strong>Stage:</strong> {{ opp.currentStage }}
                      </span>
                      <span class="opp-meta-item">
                        <strong>Value:</strong> {{ opp.estimatedValue | currency }}
                      </span>
                      <span class="opp-meta-item">
                        <strong>Close Date:</strong> {{ opp.estimatedCloseDate | date }}
                      </span>
                      <span class="opp-meta-item">
                        <strong>Probability:</strong> {{ opp.probability }}%
                      </span>
                    </div>
                    <p v-if="opp.description" class="opp-description">{{ opp.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Activities Tab — now using ActivityTimeline -->
            <div v-if="activeTab === 'activities'" class="activities-tab">
              <ActivityTimeline
                :activities="timelineActivities"
                :show-filters="true"
                @activity-click="handleActivityClick"
              />
            </div>

            <!-- Documents Tab -->
            <div v-if="activeTab === 'documents'" class="documents-tab">
              <div v-if="contactDocuments.length === 0" class="empty-tab-state">
                <p class="empty-title">No documents</p>
                <p class="empty-subtitle">There are no sales documents linked to this contact.</p>
              </div>
              <div v-else class="doc-list">
                <div
                  v-for="doc in contactDocuments"
                  :key="doc.id"
                  class="doc-card d365-card"
                  @click="goToDocument(doc)"
                >
                  <div class="doc-card-header">
                    <div class="doc-type-number">
                      <StatusBadge :status="doc.type === 'Credit Memo' ? 'Draft' : doc.type" :label="doc.type" />
                      <span class="doc-number">{{ doc.number }}</span>
                    </div>
                    <StatusBadge :status="doc.status" />
                  </div>
                  <div class="doc-card-body">
                    <div class="doc-meta">
                      <span><strong>Total:</strong> {{ doc.total | currency }}</span>
                      <span><strong>Items:</strong> {{ doc.lines.length }}</span>
                      <span><strong>Created:</strong> {{ doc.createdAt | date }}</span>
                    </div>
                    <p v-if="doc.notes" class="doc-notes">{{ doc.notes }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Campaigns Tab -->
            <div v-if="activeTab === 'campaigns'" class="campaigns-tab">
              <div v-if="contactCampaigns.length === 0" class="empty-tab-state">
                <p class="empty-title">No campaigns</p>
                <p class="empty-subtitle">This contact is not part of any campaigns.</p>
              </div>
              <div v-else class="campaign-list">
                <div
                  v-for="camp in contactCampaigns"
                  :key="camp.id"
                  class="campaign-card d365-card"
                  @click="$router.push('/campaigns/' + camp.id)"
                >
                  <div class="campaign-card-header">
                    <span class="campaign-card-name">{{ camp.name }}</span>
                    <StatusBadge :status="camp.status" />
                  </div>
                  <div class="campaign-card-body">
                    <div class="campaign-meta">
                      <span class="campaign-meta-item">
                        <strong>Type:</strong> {{ camp.type }}
                      </span>
                      <span class="campaign-meta-item">
                        <strong>Start:</strong> {{ camp.startDate | date }}
                      </span>
                      <span class="campaign-meta-item">
                        <strong>End:</strong> {{ camp.endDate | date }}
                      </span>
                      <span class="campaign-meta-item">
                        <strong>Budget:</strong> {{ camp.budget | currency }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- FactBox Right Panel -->
        <FactBox
          :sections="factBoxSections"
          :collapsed="factBoxCollapsed"
          @toggle="factBoxCollapsed = $event"
          @item-click="handleFactBoxClick"
        />
      </div>
    </template>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Contact"
      :message="'Are you sure you want to delete &quot;' + (contact ? contact.name : '') + '&quot;? This action cannot be undone.'"
      confirm-text="Delete"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CommandBar from '@/components/layout/CommandBar.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import FactBox from '@/components/common/FactBox.vue'
import ActivityTimeline from '@/components/common/ActivityTimeline.vue'
import RecordNavigation from '@/components/common/RecordNavigation.vue'
import salespersons from '@/data/salespersons'

export default {
  name: 'ContactDetail',
  components: {
    CommandBar,
    Breadcrumb,
    ConfirmDialog,
    StatusBadge,
    FactBox,
    ActivityTimeline,
    RecordNavigation
  },
  data() {
    return {
      activeTab: 'general',
      showDeleteDialog: false,
      salespersons,
      factBoxCollapsed: false
    }
  },
  computed: {
    ...mapGetters('contacts', ['getContactById', 'allContacts']),
    ...mapGetters('opportunities', { allOpportunities: 'allOpportunities' }),
    ...mapGetters('activities', { allActivitiesList: 'allActivities' }),
    ...mapGetters('sales', { allDocuments: 'allDocuments' }),
    ...mapGetters('campaigns', { allCampaigns: 'allCampaigns' }),

    contact() {
      return this.getContactById(this.$route.params.id)
    },

    parentCompany() {
      if (this.contact && this.contact.companyId) {
        return this.getContactById(this.contact.companyId)
      }
      return null
    },

    currentContactIndex() {
      if (!this.contact) return 0
      var idx = this.allContacts.findIndex(c => c.id === this.contact.id)
      return idx >= 0 ? idx : 0
    },

    breadcrumbs() {
      const crumbs = [
        { label: 'Home', path: '/dashboard' },
        { label: 'Contacts', path: '/contacts' }
      ]
      if (this.contact) {
        crumbs.push({ label: this.contact.name })
      } else {
        crumbs.push({ label: 'Details' })
      }
      return crumbs
    },

    commandActions() {
      return [
        {
          id: 'edit',
          label: 'Edit',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.146.854a.5.5 0 01.708 0l2.292 2.292a.5.5 0 010 .708L5.854 13.146a.5.5 0 01-.233.131l-4 1a.5.5 0 01-.611-.611l1-4a.5.5 0 01.131-.233L12.146.854z"/></svg>',
          primary: true,
          event: 'edit'
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5 2V1h6v1h4v1H1V2h4zm1 3v8h1V5H6zm3 0v8h1V5H9zM3 4v10h10V4H3z"/></svg>',
          event: 'delete'
        },
        {
          id: 'new-activity',
          label: 'New Activity',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 110 14A7 7 0 018 1zm0 3v4h4v1H7V4h1z"/></svg>',
          extra: true,
          event: 'new-activity'
        },
        {
          id: 'new-quote',
          label: 'New Quote',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h10a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1zm1 3v1h8V4H4zm0 3v1h8V7H4zm0 3v1h5v-1H4z"/></svg>',
          extra: true,
          event: 'new-quote'
        }
      ]
    },

    contactOpportunities() {
      if (!this.contact) return []
      return this.allOpportunities.filter(o => o.contactId === this.contact.id)
    },

    contactActivities() {
      if (!this.contact) return []
      return this.allActivitiesList.filter(a => a.contactId === this.contact.id)
    },

    sortedActivities() {
      return [...this.contactActivities].sort((a, b) => {
        // Sort by due date descending (most recent first)
        const dateA = a.dueDate || ''
        const dateB = b.dueDate || ''
        return dateB.localeCompare(dateA)
      })
    },

    timelineActivities() {
      return this.contactActivities.map(a => ({
        id: a.id,
        type: a.type,
        subject: a.subject,
        description: a.description,
        date: a.dueDate || a.createdAt,
        status: a.status,
        user: this.getSalespersonName(a.salesperson),
        duration: a.duration
      }))
    },

    contactDocuments() {
      if (!this.contact) return []
      return this.allDocuments.filter(d => d.contactId === this.contact.id)
    },

    contactCampaigns() {
      if (!this.contact) return []
      return this.allCampaigns.filter(c => (c.targetContacts || []).includes(this.contact.id))
    },

    tabs() {
      return [
        { id: 'general', label: 'General' },
        { id: 'opportunities', label: 'Opportunities', count: this.contactOpportunities.length },
        { id: 'activities', label: 'Activities', count: this.contactActivities.length },
        { id: 'documents', label: 'Documents', count: this.contactDocuments.length },
        { id: 'campaigns', label: 'Campaigns', count: this.contactCampaigns.length }
      ]
    },

    factBoxSections() {
      if (!this.contact) return []
      return [
        {
          id: 'related',
          title: 'Related',
          badge: this.contactOpportunities.length + this.contactActivities.length + this.contactDocuments.length + this.contactCampaigns.length,
          items: [
            {
              label: 'Opportunities',
              value: this.contactOpportunities.length,
              type: 'link',
              link: null,
              _tab: 'opportunities'
            },
            {
              label: 'Activities',
              value: this.contactActivities.length,
              type: 'link',
              link: null,
              _tab: 'activities'
            },
            {
              label: 'Documents',
              value: this.contactDocuments.length,
              type: 'link',
              link: null,
              _tab: 'documents'
            },
            {
              label: 'Campaigns',
              value: this.contactCampaigns.length,
              type: 'link',
              link: null,
              _tab: 'campaigns'
            }
          ]
        },
        {
          id: 'details',
          title: 'Details',
          items: [
            {
              label: 'Business Relation',
              value: this.contact.businessRelation || '-',
              type: 'badge'
            },
            {
              label: 'Industry',
              value: this.contact.industry || '-',
              type: 'text'
            },
            {
              label: 'Salesperson',
              value: this.getSalespersonName(this.contact.salesperson),
              type: 'text'
            }
          ]
        },
        {
          id: 'contactInfo',
          title: 'Contact Info',
          items: [
            {
              label: 'Email',
              value: this.contact.email || '-',
              type: 'link',
              link: this.contact.email ? 'mailto:' + this.contact.email : null
            },
            {
              label: 'Phone',
              value: this.contact.phone || '-',
              type: 'text'
            },
            {
              label: 'Website',
              value: this.contact.website || '-',
              type: 'link',
              link: this.contact.website || null
            }
          ]
        }
      ]
    }
  },
  created() {
    this.$root.$on('shortcut-refresh', this.refreshData)
    this.$root.$on('shortcut-save', this.handleSave)
  },
  beforeDestroy() {
    this.$root.$off('shortcut-refresh', this.refreshData)
    this.$root.$off('shortcut-save', this.handleSave)
  },
  methods: {
    ...mapActions('contacts', ['deleteContact']),

    goToEdit() {
      this.$router.push('/contacts/' + this.contact.id + '/edit')
    },

    goToNewActivity() {
      this.$router.push({ path: '/activities/new', query: { contactId: this.contact.id } })
    },

    goToNewQuote() {
      this.$router.push({ path: '/sales/Quote/new', query: { contactId: this.contact.id } })
    },

    goToDocument(doc) {
      const typeMap = { 'Quote': 'Quote', 'Order': 'Order', 'Invoice': 'Invoice', 'Credit Memo': 'Credit Memo' }
      const type = typeMap[doc.type] || doc.type
      this.$router.push('/sales/' + encodeURIComponent(type) + '/' + doc.id)
    },

    handleDelete() {
      const contactName = this.contact.name
      this.deleteContact(this.contact.id)
      this.showDeleteDialog = false
      this.$store.dispatch('ui/addAlert', {
        type: 'success',
        title: 'Contact deleted',
        message: '"' + contactName + '" has been deleted.',
        duration: 3000
      })
      this.$router.push('/contacts')
    },

    getSalespersonName(spId) {
      const sp = this.salespersons.find(s => s.id === spId)
      return sp ? sp.name : spId || '--'
    },

    handleRecordNav(direction) {
      var contacts = this.allContacts
      if (!contacts.length) return
      var idx = this.currentContactIndex
      var targetIdx = idx
      if (direction === 'first') {
        targetIdx = 0
      } else if (direction === 'prev') {
        targetIdx = Math.max(0, idx - 1)
      } else if (direction === 'next') {
        targetIdx = Math.min(contacts.length - 1, idx + 1)
      } else if (direction === 'last') {
        targetIdx = contacts.length - 1
      }
      if (targetIdx !== idx && contacts[targetIdx]) {
        this.$router.push('/contacts/' + contacts[targetIdx].id)
      }
    },

    handleActivityClick(activity) {
      // Navigate to activity detail if a route exists
      if (activity && activity.id) {
        this.$router.push('/activities/' + activity.id)
      }
    },

    handleFactBoxClick(item) {
      // If the item has a _tab property, switch to that tab
      if (item && item._tab) {
        this.activeTab = item._tab
      }
      // Email links and website links are handled by FactBox internally via item.link
    },

    refreshData() {
      this.$store.dispatch('contacts/initContacts')
    },

    handleSave() {
      // On the detail page, save means navigate to edit
      this.goToEdit()
    }
  }
}
</script>

<style scoped>
.contact-detail-view {
  min-height: 100%;
}

/* Detail Layout: flex container for main + FactBox */
.detail-layout {
  display: flex;
  min-height: calc(100vh - 88px);
}
.detail-main {
  flex: 1;
  min-width: 0;
  transition: margin-right 0.2s ease;
}
.detail-main.factbox-open {
  margin-right: 0;
}

/* Header */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  color: #605E5C;
  cursor: pointer;
}
.back-btn:hover {
  background: #F3F2F1;
  color: #323130;
}

.contact-name {
  font-size: 22px;
  font-weight: 600;
  color: #323130;
  margin: 0;
}

.header-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.job-title-text {
  font-size: 13px;
  color: #605E5C;
}

/* General Tab */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.section-card {
  overflow: hidden;
}

.section-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #323130;
  background: #FAFAFA;
  border-bottom: 1px solid #EDEBE9;
}

.section-body {
  padding: 12px 16px;
}

.detail-field {
  display: flex;
  padding: 6px 0;
  border-bottom: 1px solid #F3F2F1;
}
.detail-field:last-child {
  border-bottom: none;
}

.field-label {
  flex: 0 0 140px;
  font-size: 13px;
  font-weight: 600;
  color: #605E5C;
}

.field-value {
  flex: 1;
  font-size: 13px;
  color: #323130;
}

.field-link {
  color: #0078D4;
  text-decoration: none;
}
.field-link:hover {
  text-decoration: underline;
}

.field-empty {
  color: #A19F9D;
}

.notes-text {
  font-size: 13px;
  color: #323130;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

/* Tab Count */
.tab-count {
  font-size: 12px;
  color: #A19F9D;
  margin-left: 2px;
}

/* Empty Tab State */
.empty-tab-state {
  text-align: center;
  padding: 48px 24px;
}
.empty-tab-state .empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #323130;
  margin: 0 0 4px;
}
.empty-tab-state .empty-subtitle {
  font-size: 13px;
  color: #605E5C;
  margin: 0;
}

/* Opportunity Cards */
.opp-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.opp-card {
  padding: 12px 16px;
  cursor: pointer;
  transition: box-shadow 0.15s;
}
.opp-card:hover {
  box-shadow: 0 3.2px 7.2px rgba(0,0,0,0.13);
}

.opp-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.opp-name {
  font-size: 14px;
  font-weight: 600;
  color: #0078D4;
}

.opp-card-body .opp-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #605E5C;
}

.opp-meta-item strong {
  color: #323130;
}

.opp-description {
  margin: 8px 0 0;
  font-size: 13px;
  color: #605E5C;
  line-height: 1.5;
}

/* Documents */
.doc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.doc-card {
  padding: 12px 16px;
  cursor: pointer;
  transition: box-shadow 0.15s;
}
.doc-card:hover {
  box-shadow: 0 3.2px 7.2px rgba(0,0,0,0.13);
}

.doc-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.doc-type-number {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-number {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
}

.doc-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #605E5C;
}
.doc-meta strong {
  color: #323130;
}

.doc-notes {
  margin: 8px 0 0;
  font-size: 12px;
  color: #A19F9D;
  line-height: 1.4;
}

/* Campaign Cards */
.campaign-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.campaign-card {
  padding: 12px 16px;
  cursor: pointer;
  transition: box-shadow 0.15s;
}
.campaign-card:hover {
  box-shadow: 0 3.2px 7.2px rgba(0,0,0,0.13);
}

.campaign-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.campaign-card-name {
  font-size: 14px;
  font-weight: 600;
  color: #0078D4;
}

.campaign-card-body .campaign-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #605E5C;
}

.campaign-meta-item strong {
  color: #323130;
}

/* Responsive */
@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-layout {
    flex-direction: column;
  }
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .header-right {
    align-self: flex-end;
  }
}
</style>
