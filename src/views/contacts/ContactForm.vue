<template>
  <div class="contact-form-view">
    <!-- Breadcrumb -->
    <div class="px-4 pt-3">
      <Breadcrumb :items="breadcrumbs" />
    </div>

    <!-- Page Header -->
    <div class="page-header px-4 pb-2">
      <h1 class="page-title">{{ isEditMode ? 'Edit Contact' : 'New Contact' }}</h1>
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
            <div class="section-header">Contact Information</div>
            <div class="section-body">

              <div class="d365-field-group">
                <label class="d365-field-label">Type <span class="required">*</span></label>
                <select v-model="form.type" class="d365-field-input">
                  <option value="Company">Company</option>
                  <option value="Person">Person</option>
                </select>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label" title="The contact's display name">Name <span class="required">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  class="d365-field-input"
                  :class="{ 'input-error': !form.name && submitted }"
                  placeholder="Enter contact name"
                />
              </div>

              <template v-if="form.type === 'Person'">
                <div class="d365-field-group">
                  <label class="d365-field-label">First Name</label>
                  <input v-model="form.firstName" type="text" class="d365-field-input" placeholder="First name" />
                </div>

                <div class="d365-field-group">
                  <label class="d365-field-label">Last Name</label>
                  <input v-model="form.lastName" type="text" class="d365-field-input" placeholder="Last name" />
                </div>

                <div class="d365-field-group">
                  <label class="d365-field-label">Company</label>
                  <select v-model="form.companyId" class="d365-field-input">
                    <option value="">-- No Company --</option>
                    <option v-for="company in companies" :key="company.id" :value="company.id">{{ company.name }}</option>
                  </select>
                </div>
              </template>

              <div class="d365-field-group">
                <label class="d365-field-label" title="Primary email address">Email</label>
                <input v-model="form.email" type="email" class="d365-field-input" placeholder="email@example.com" />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Phone</label>
                <input v-model="form.phone" type="text" class="d365-field-input" placeholder="+1-555-0000" />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Mobile</label>
                <input v-model="form.mobile" type="text" class="d365-field-input" placeholder="+1-555-0001" />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Website</label>
                <input v-model="form.website" type="url" class="d365-field-input" placeholder="https://www.example.com" />
              </div>

            </div>
          </div>

          <div v-if="form.type === 'Person'" class="section-card d365-card mt-3">
            <div class="section-header">Professional</div>
            <div class="section-body">
              <div class="d365-field-group">
                <label class="d365-field-label">Job Title</label>
                <input v-model="form.jobTitle" type="text" class="d365-field-input" placeholder="Job title" />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Department</label>
                <input v-model="form.department" type="text" class="d365-field-input" placeholder="Department" />
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="form-column">
          <div class="section-card d365-card">
            <div class="section-header">Address</div>
            <div class="section-body">
              <div class="d365-field-group">
                <label class="d365-field-label">Address Line 1</label>
                <input v-model="form.address.line1" type="text" class="d365-field-input" placeholder="Street address" />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">City</label>
                <input v-model="form.address.city" type="text" class="d365-field-input" placeholder="City" />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">State</label>
                <input v-model="form.address.state" type="text" class="d365-field-input" placeholder="State / Province" />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Postal Code</label>
                <input v-model="form.address.postalCode" type="text" class="d365-field-input" placeholder="Postal code" />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Country</label>
                <input v-model="form.address.country" type="text" class="d365-field-input" placeholder="Country" />
              </div>
            </div>
          </div>

          <div class="section-card d365-card mt-3">
            <div class="section-header">Business Details</div>
            <div class="section-body">
              <div class="d365-field-group">
                <label class="d365-field-label">Industry</label>
                <select v-model="form.industry" class="d365-field-input">
                  <option value="">-- Select Industry --</option>
                  <option v-for="ind in industryOptions" :key="ind" :value="ind">{{ ind }}</option>
                </select>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label" title="The business relationship type with this contact">Business Relation</label>
                <select v-model="form.businessRelation" class="d365-field-input">
                  <option value="">-- Select Relation --</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Customer">Customer</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Partner">Partner</option>
                </select>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Salesperson</label>
                <select v-model="form.salesperson" class="d365-field-input">
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
                  placeholder="Add notes about this contact..."
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
  name: 'ContactForm',
  components: {
    CommandBar,
    Breadcrumb
  },
  data() {
    return {
      form: {
        type: 'Company',
        name: '',
        firstName: '',
        lastName: '',
        companyId: '',
        email: '',
        phone: '',
        mobile: '',
        address: {
          line1: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        website: '',
        industry: '',
        businessRelation: '',
        salesperson: '',
        jobTitle: '',
        department: '',
        notes: ''
      },
      submitted: false,
      validationError: '',
      saving: false,
      salespersons,
      industryOptions: [
        'Education',
        'Finance',
        'Food & Beverage',
        'Healthcare',
        'Manufacturing',
        'Publishing',
        'Retail',
        'Technology',
        'Toys'
      ]
    }
  },
  computed: {
    ...mapGetters('contacts', ['getContactById', 'companies']),

    isEditMode() {
      return !!this.$route.params.id
    },

    existingContact() {
      if (this.isEditMode) {
        return this.getContactById(this.$route.params.id)
      }
      return null
    },

    breadcrumbs() {
      const crumbs = [
        { label: 'Home', path: '/dashboard' },
        { label: 'Contacts', path: '/contacts' }
      ]
      if (this.isEditMode && this.existingContact) {
        crumbs.push({ label: this.existingContact.name, path: '/contacts/' + this.existingContact.id })
        crumbs.push({ label: 'Edit' })
      } else {
        crumbs.push({ label: 'New' })
      }
      return crumbs
    },

    commandActions() {
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
  created() {
    if (this.isEditMode && this.existingContact) {
      this.loadExistingContact()
    }
    // Keyboard shortcut listeners
    eventBus.on('shortcut-save', this.handleSave)
    this._escHandler = this.handleEscape.bind(this)
    document.addEventListener('keydown', this._escHandler)
  },
  beforeUnmount() {
    eventBus.off('shortcut-save', this.handleSave)
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler)
    }
  },
  watch: {
    existingContact(newVal) {
      if (newVal && this.isEditMode) {
        this.loadExistingContact()
      }
    },
    'form.type'(newType) {
      // Auto-generate name from first + last when type is Person
      if (newType === 'Company') {
        this.form.firstName = ''
        this.form.lastName = ''
        this.form.companyId = ''
        this.form.jobTitle = ''
        this.form.department = ''
      }
    },
    'form.firstName'() {
      this.updatePersonName()
    },
    'form.lastName'() {
      this.updatePersonName()
    }
  },
  methods: {
    ...mapActions('contacts', ['addContact', 'updateContact']),

    loadExistingContact() {
      const c = this.existingContact
      if (!c) return
      this.form = {
        type: c.type || 'Company',
        name: c.name || '',
        firstName: c.firstName || '',
        lastName: c.lastName || '',
        companyId: c.companyId || '',
        email: c.email || '',
        phone: c.phone || '',
        mobile: c.mobile || '',
        address: {
          line1: (c.address && c.address.line1) || '',
          city: (c.address && c.address.city) || '',
          state: (c.address && c.address.state) || '',
          postalCode: (c.address && c.address.postalCode) || '',
          country: (c.address && c.address.country) || ''
        },
        website: c.website || '',
        industry: c.industry || '',
        businessRelation: c.businessRelation || '',
        salesperson: c.salesperson || '',
        jobTitle: c.jobTitle || '',
        department: c.department || '',
        notes: c.notes || ''
      }
    },

    updatePersonName() {
      if (this.form.type === 'Person') {
        const first = (this.form.firstName || '').trim()
        const last = (this.form.lastName || '').trim()
        if (first || last) {
          this.form.name = [first, last].filter(Boolean).join(' ')
        }
      }
    },

    validate() {
      this.validationError = ''
      if (!this.form.name || !this.form.name.trim()) {
        this.validationError = 'Name is required.'
        return false
      }
      return true
    },

    generateId() {
      // Generate a unique contact ID
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 1000)
      return 'CT-' + timestamp.toString().slice(-5) + random
    },

    async handleSave() {
      if (this.saving) return

      this.submitted = true

      if (!this.validate()) {
        return
      }

      this.saving = true

      const contactData = {
        type: this.form.type,
        name: this.form.name.trim(),
        firstName: this.form.type === 'Person' ? this.form.firstName.trim() : '',
        lastName: this.form.type === 'Person' ? this.form.lastName.trim() : '',
        companyId: this.form.type === 'Person' ? (this.form.companyId || null) : null,
        email: this.form.email.trim(),
        phone: this.form.phone.trim(),
        mobile: this.form.mobile.trim(),
        address: {
          line1: this.form.address.line1.trim(),
          city: this.form.address.city.trim(),
          state: this.form.address.state.trim(),
          postalCode: this.form.address.postalCode.trim(),
          country: this.form.address.country.trim()
        },
        website: this.form.website.trim(),
        industry: this.form.industry,
        businessRelation: this.form.businessRelation,
        salesperson: this.form.salesperson,
        jobTitle: this.form.type === 'Person' ? this.form.jobTitle.trim() : '',
        department: this.form.type === 'Person' ? this.form.department.trim() : '',
        organizationLevel: '',
        mailingGroups: [],
        notes: this.form.notes.trim()
      }

      // Brief delay to show the saving indicator
      await new Promise(function (resolve) { setTimeout(resolve, 300) })

      if (this.isEditMode) {
        contactData.id = this.existingContact.id
        contactData.createdAt = this.existingContact.createdAt
        contactData.updatedAt = new Date().toISOString()
        this.updateContact(contactData)
        this.$store.dispatch('ui/addAlert', {
          type: 'success',
          title: 'Contact updated',
          message: '"' + contactData.name + '" has been updated successfully.',
          duration: 3000
        })
        this.saving = false
        this.$router.push('/contacts/' + contactData.id)
      } else {
        contactData.id = this.generateId()
        contactData.createdAt = new Date().toISOString()
        contactData.updatedAt = new Date().toISOString()
        this.addContact(contactData)
        this.$store.dispatch('ui/addAlert', {
          type: 'success',
          title: 'Contact created',
          message: '"' + contactData.name + '" has been created successfully.',
          duration: 3000
        })
        this.saving = false
        this.$router.push('/contacts/' + contactData.id)
      }
    },

    handleDiscard() {
      if (this.isEditMode && this.existingContact) {
        this.$router.push('/contacts/' + this.existingContact.id)
      } else {
        this.$router.push('/contacts')
      }
    },

    handleEscape(e) {
      if (e.key === 'Escape') {
        this.handleDiscard()
      }
    }
  }
}
</script>

<style scoped>
.contact-form-view {
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

.notes-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  line-height: 1.5;
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
