<template>
  <div class="campaign-form-view">
    <!-- Breadcrumb -->
    <div class="px-4 pt-3">
      <Breadcrumb :items="breadcrumbs" />
    </div>

    <!-- Page Header -->
    <div class="page-header px-4 pb-2">
      <h1 class="page-title">{{ isEditMode ? 'Edit Campaign' : 'New Campaign' }}</h1>
    </div>

    <!-- Command Bar -->
    <CommandBar
      :actions="commandActions"
      :show-view-switcher="false"
      :show-filter="false"
      @save="handleSave"
      @discard="handleDiscard"
    />

    <!-- Form Content -->
    <div class="form-content px-4 py-4">
      <!-- Validation Error -->
      <div v-if="validationError" class="validation-error">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#D13438">
          <path d="M8 1a7 7 0 110 14A7 7 0 018 1zM5.354 5.354a.5.5 0 00-.708.708L7.293 8l-2.647 2.646a.5.5 0 00.708.708L8 8.707l2.646 2.647a.5.5 0 00.708-.708L8.707 8l2.647-2.646a.5.5 0 00-.708-.708L8 7.293 5.354 4.646z"/>
        </svg>
        <span>{{ validationError }}</span>
      </div>

      <div class="form-grid">
        <!-- Left Column -->
        <div class="form-column">
          <div class="section-card d365-card">
            <div class="section-header">Campaign Information</div>
            <div class="section-body">

              <div class="d365-field-group">
                <label class="d365-field-label">Name <span class="required">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  class="d365-field-input"
                  :class="{ 'input-error': !form.name && submitted }"
                  placeholder="Enter campaign name"
                />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Description</label>
                <textarea
                  v-model="form.description"
                  class="d365-field-input notes-textarea"
                  rows="3"
                  placeholder="Describe the campaign purpose and goals..."
                ></textarea>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Type <span class="required">*</span></label>
                <select v-model="form.type" class="d365-field-input">
                  <option value="">-- Select Type --</option>
                  <option value="Email">Email</option>
                  <option value="Event">Event</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Direct Mail">Direct Mail</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Trade Show">Trade Show</option>
                </select>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Status</label>
                <select v-model="form.status" class="d365-field-input">
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Start Date <span class="required">*</span></label>
                <input
                  v-model="form.startDate"
                  type="date"
                  class="d365-field-input"
                  :class="{ 'input-error': !form.startDate && submitted }"
                />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">End Date</label>
                <input
                  v-model="form.endDate"
                  type="date"
                  class="d365-field-input"
                  :class="{ 'input-error': dateError }"
                />
                <span v-if="dateError" class="field-error-text">End date must be after start date.</span>
              </div>

            </div>
          </div>

          <div class="section-card d365-card mt-3">
            <div class="section-header">Target Contacts</div>
            <div class="section-body">
              <div class="d365-field-group">
                <label class="d365-field-label">Target Segment</label>
                <input
                  v-model="form.targetSegment"
                  type="text"
                  class="d365-field-input"
                  placeholder="e.g. Enterprise Customers, Retail Prospects"
                />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Select Contacts</label>
                <div class="contacts-select-list">
                  <div
                    v-for="contact in availableContacts"
                    :key="contact.id"
                    class="contact-select-item"
                    :class="{ selected: isContactSelected(contact.id) }"
                    @click="toggleContact(contact.id)"
                  >
                    <input
                      type="checkbox"
                      :checked="isContactSelected(contact.id)"
                      class="contact-checkbox"
                      @click.stop="toggleContact(contact.id)"
                    />
                    <span class="contact-select-name">{{ contact.name }}</span>
                    <span class="contact-select-type">{{ contact.type }}</span>
                  </div>
                </div>
                <span class="contacts-count">{{ form.targetContacts.length }} contact(s) selected</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="form-column">
          <div class="section-card d365-card">
            <div class="section-header">Budget & Assignment</div>
            <div class="section-body">

              <div class="d365-field-group">
                <label class="d365-field-label">Budget ($)</label>
                <input
                  v-model.number="form.budget"
                  type="number"
                  class="d365-field-input"
                  placeholder="0.00"
                  min="0"
                  step="100"
                />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Salesperson</label>
                <select v-model="form.salespersonId" class="d365-field-input">
                  <option value="">-- Select Salesperson --</option>
                  <option v-for="sp in salespersons" :key="sp.id" :value="sp.id">{{ sp.name }} ({{ sp.role }})</option>
                </select>
              </div>

            </div>
          </div>

          <div class="section-card d365-card mt-3">
            <div class="section-header">Notes</div>
            <div class="section-body">
              <div class="d365-field-group">
                <textarea
                  v-model="form.notes"
                  class="d365-field-input notes-textarea"
                  rows="4"
                  placeholder="Add notes about this campaign..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Saving Overlay -->
    <div v-if="saving" class="saving-overlay">
      <div class="saving-indicator">
        <div class="saving-spinner"></div>
        <span class="saving-text">Saving...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CommandBar from '@/components/layout/CommandBar.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import salespersons from '@/data/salespersons'
import eventBus from '../../utils/eventBus'

export default {
  name: 'CampaignForm',
  components: {
    CommandBar,
    Breadcrumb
  },
  data: function () {
    return {
      form: {
        name: '',
        description: '',
        type: '',
        status: 'Planning',
        startDate: '',
        endDate: '',
        budget: 0,
        salespersonId: '',
        targetSegment: '',
        targetContacts: [],
        notes: ''
      },
      submitted: false,
      validationError: '',
      saving: false,
      salespersons: salespersons
    }
  },
  computed: {
    ...mapGetters('campaigns', ['getCampaignById']),
    ...mapGetters('contacts', { allContacts: 'allContacts' }),

    isEditMode: function () {
      return !!this.$route.params.id
    },

    existingCampaign: function () {
      if (this.isEditMode) {
        return this.getCampaignById(this.$route.params.id)
      }
      return null
    },

    availableContacts: function () {
      return this.allContacts || []
    },

    dateError: function () {
      if (this.form.startDate && this.form.endDate) {
        return new Date(this.form.endDate) < new Date(this.form.startDate)
      }
      return false
    },

    breadcrumbs: function () {
      var crumbs = [
        { label: 'Home', path: '/dashboard' },
        { label: 'Campaigns', path: '/campaigns' }
      ]
      if (this.isEditMode && this.existingCampaign) {
        crumbs.push({ label: this.existingCampaign.name, path: '/campaigns/' + this.existingCampaign.id })
        crumbs.push({ label: 'Edit' })
      } else {
        crumbs.push({ label: 'New' })
      }
      return crumbs
    },

    commandActions: function () {
      return [
        {
          id: 'save',
          label: this.saving ? 'Saving...' : 'Save',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.5 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V3.5L12.5 1zM8 13a2 2 0 110-4 2 2 0 010 4zM11 5H3V2h8v3z"/></svg>',
          primary: true,
          disabled: this.saving,
          event: 'save'
        },
        {
          id: 'discard',
          label: 'Discard',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 2.086L8 6.586l4.5-4.5L13.914 3.5 9.414 8l4.5 4.5-1.414 1.414L8 9.414l-4.5 4.5L2.086 12.5l4.5-4.5-4.5-4.5L3.5 2.086z"/></svg>',
          disabled: this.saving,
          event: 'discard'
        }
      ]
    }
  },
  created: function () {
    if (this.isEditMode && this.existingCampaign) {
      this.loadExistingCampaign()
    }
    eventBus.on('shortcut-save', this.handleSave)
    var self = this
    this._escHandler = function (e) {
      if (e.key === 'Escape') {
        self.handleDiscard()
      }
    }
    document.addEventListener('keydown', this._escHandler)
  },
  beforeUnmount: function () {
    eventBus.off('shortcut-save', this.handleSave)
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler)
    }
  },
  watch: {
    existingCampaign: function (newVal) {
      if (newVal && this.isEditMode) {
        this.loadExistingCampaign()
      }
    }
  },
  methods: {
    ...mapActions('campaigns', ['addCampaign', 'updateCampaign']),

    loadExistingCampaign: function () {
      var c = this.existingCampaign
      if (!c) return
      this.form = {
        name: c.name || '',
        description: c.description || '',
        type: c.type || '',
        status: c.status || 'Planning',
        startDate: c.startDate ? c.startDate.substring(0, 10) : '',
        endDate: c.endDate ? c.endDate.substring(0, 10) : '',
        budget: c.budget || 0,
        salespersonId: c.salespersonId || '',
        targetSegment: c.targetSegment || '',
        targetContacts: c.targetContacts ? c.targetContacts.slice() : [],
        notes: c.notes || ''
      }
    },

    isContactSelected: function (contactId) {
      return this.form.targetContacts.indexOf(contactId) !== -1
    },

    toggleContact: function (contactId) {
      var idx = this.form.targetContacts.indexOf(contactId)
      if (idx === -1) {
        this.form.targetContacts.push(contactId)
      } else {
        this.form.targetContacts.splice(idx, 1)
      }
    },

    getSalespersonName: function (spId) {
      var sp = this.salespersons.find(function (s) { return s.id === spId })
      return sp ? sp.name : ''
    },

    validate: function () {
      this.validationError = ''
      if (!this.form.name || !this.form.name.trim()) {
        this.validationError = 'Campaign name is required.'
        return false
      }
      if (!this.form.type) {
        this.validationError = 'Campaign type is required.'
        return false
      }
      if (!this.form.startDate) {
        this.validationError = 'Start date is required.'
        return false
      }
      if (this.dateError) {
        this.validationError = 'End date must be after start date.'
        return false
      }
      return true
    },

    generateId: function () {
      var timestamp = Date.now()
      var random = Math.floor(Math.random() * 1000)
      return 'CMP-' + timestamp.toString().slice(-5) + random
    },

    handleSave: async function () {
      if (this.saving) return

      this.submitted = true

      if (!this.validate()) {
        return
      }

      this.saving = true

      var spName = this.getSalespersonName(this.form.salespersonId)

      var campaignData = {
        name: this.form.name.trim(),
        description: this.form.description.trim(),
        type: this.form.type,
        status: this.form.status,
        startDate: this.form.startDate ? new Date(this.form.startDate).toISOString() : '',
        endDate: this.form.endDate ? new Date(this.form.endDate).toISOString() : '',
        budget: parseFloat(this.form.budget) || 0,
        salespersonId: this.form.salespersonId,
        salespersonName: spName,
        targetSegment: this.form.targetSegment.trim(),
        targetContacts: this.form.targetContacts.slice(),
        notes: this.form.notes.trim()
      }

      // Brief delay to show saving indicator
      await new Promise(function (resolve) { setTimeout(resolve, 300) })

      if (this.isEditMode) {
        campaignData.id = this.existingCampaign.id
        campaignData.number = this.existingCampaign.number
        campaignData.createdAt = this.existingCampaign.createdAt
        campaignData.updatedAt = new Date().toISOString()
        // Preserve existing fields not in form
        campaignData.actualCost = this.existingCampaign.actualCost || 0
        campaignData.responses = this.existingCampaign.responses || 0
        campaignData.successRate = this.existingCampaign.successRate || 0
        campaignData.linkedOpportunities = this.existingCampaign.linkedOpportunities || []
        campaignData.activities = this.existingCampaign.activities || []
        this.updateCampaign(campaignData)
        this.$store.dispatch('ui/addAlert', {
          type: 'success',
          title: 'Campaign updated',
          message: '"' + campaignData.name + '" has been updated successfully.',
          duration: 3000
        })
        this.saving = false
        this.$router.push('/campaigns/' + campaignData.id)
      } else {
        var newId = this.generateId()
        campaignData.id = newId
        campaignData.number = newId
        campaignData.createdAt = new Date().toISOString()
        campaignData.updatedAt = new Date().toISOString()
        campaignData.actualCost = 0
        campaignData.responses = 0
        campaignData.successRate = 0
        campaignData.linkedOpportunities = []
        campaignData.activities = []
        this.addCampaign(campaignData)
        this.$store.dispatch('ui/addAlert', {
          type: 'success',
          title: 'Campaign created',
          message: '"' + campaignData.name + '" has been created successfully.',
          duration: 3000
        })
        this.saving = false
        this.$router.push('/campaigns/' + campaignData.id)
      }
    },

    handleDiscard: function () {
      if (this.isEditMode && this.existingCampaign) {
        this.$router.push('/campaigns/' + this.existingCampaign.id)
      } else {
        this.$router.push('/campaigns')
      }
    }
  }
}
</script>

<style scoped>
.campaign-form-view {
  min-height: 100%;
  position: relative;
}

.page-header {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #323130;
}

/* Validation Error */
.validation-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin-bottom: 12px;
  background: #FDE7E9;
  border: 1px solid #F1BBBC;
  border-radius: 2px;
  color: #D13438;
  font-size: 13px;
}

/* Form Grid */
.form-grid {
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
  padding: 16px;
}

.required {
  color: #D13438;
}

.input-error {
  border-color: #D13438 !important;
}

.field-error-text {
  font-size: 12px;
  color: #D13438;
  margin-top: 2px;
}

.notes-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  line-height: 1.5;
}

/* Contacts multi-select list */
.contacts-select-list {
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  background: #FFFFFF;
}

.contact-select-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  font-size: 13px;
  color: #323130;
  cursor: pointer;
  border-bottom: 1px solid #F3F2F1;
  transition: background 0.1s;
}
.contact-select-item:last-child {
  border-bottom: none;
}
.contact-select-item:hover {
  background: #F3F2F1;
}
.contact-select-item.selected {
  background: #DEECF9;
}

.contact-checkbox {
  flex-shrink: 0;
  cursor: pointer;
}

.contact-select-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-select-type {
  flex-shrink: 0;
  font-size: 11px;
  color: #A19F9D;
  padding: 1px 6px;
  background: #F3F2F1;
  border-radius: 2px;
}

.contacts-count {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #605E5C;
}

/* Saving Overlay */
.saving-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.saving-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: #FFFFFF;
  border: 1px solid #EDEBE9;
  border-radius: 4px;
  box-shadow: 0 3.2px 7.2px rgba(0, 0, 0, 0.13);
}

.saving-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #EDEBE9;
  border-top-color: #0078D4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.saving-text {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
}

/* Responsive */
@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
