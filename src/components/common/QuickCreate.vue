<template>
  <transition name="slide-panel">
    <div v-if="show" class="quick-create-overlay" @click.self="close">
      <div class="quick-create-panel">
        <div class="panel-header">
          <h3>Quick Create: {{ typeLabel }}</h3>
          <button class="panel-close" @click="close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3.5 2.086L7 5.586l3.5-3.5L11.914 3.5 8.414 7l3.5 3.5-1.414 1.414L7 8.414l-3.5 3.5L2.086 10.5l3.5-3.5-3.5-3.5L3.5 2.086z"/>
            </svg>
          </button>
        </div>

        <div class="panel-body">
          <!-- Type Selector -->
          <div class="d365-field-group">
            <label class="d365-field-label">Record Type</label>
            <select class="d365-field-input" v-model="selectedType">
              <option value="contact">Contact</option>
              <option value="opportunity">Opportunity</option>
              <option value="activity">Activity</option>
              <option value="quote">Quote</option>
            </select>
          </div>

          <!-- Contact Quick Fields -->
          <template v-if="selectedType === 'contact'">
            <div class="d365-field-group">
              <label class="d365-field-label">Type</label>
              <select class="d365-field-input" v-model="form.type">
                <option value="Company">Company</option>
                <option value="Person">Person</option>
              </select>
            </div>
            <div class="d365-field-group">
              <label class="d365-field-label">Name *</label>
              <input class="d365-field-input" v-model="form.name" placeholder="Enter contact name" />
            </div>
            <div class="d365-field-group">
              <label class="d365-field-label">Email</label>
              <input class="d365-field-input" type="email" v-model="form.email" placeholder="email@example.com" />
            </div>
            <div class="d365-field-group">
              <label class="d365-field-label">Phone</label>
              <input class="d365-field-input" v-model="form.phone" placeholder="+1-555-0100" />
            </div>
            <div class="d365-field-group">
              <label class="d365-field-label">Business Relation</label>
              <select class="d365-field-input" v-model="form.businessRelation">
                <option value="Prospect">Prospect</option>
                <option value="Customer">Customer</option>
                <option value="Vendor">Vendor</option>
                <option value="Partner">Partner</option>
              </select>
            </div>
          </template>

          <!-- Opportunity Quick Fields -->
          <template v-if="selectedType === 'opportunity'">
            <div class="d365-field-group">
              <label class="d365-field-label">Name *</label>
              <input class="d365-field-input" v-model="form.name" placeholder="Opportunity name" />
            </div>
            <div class="d365-field-group">
              <label class="d365-field-label">Contact</label>
              <select class="d365-field-input" v-model="form.contactId">
                <option value="">-- Select --</option>
                <option v-for="c in contacts" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="d365-field-group">
              <label class="d365-field-label">Estimated Value</label>
              <input class="d365-field-input" type="number" v-model.number="form.estimatedValue" placeholder="0" />
            </div>
            <div class="d365-field-group">
              <label class="d365-field-label">Priority</label>
              <select class="d365-field-input" v-model="form.priority">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </template>

          <!-- Activity Quick Fields -->
          <template v-if="selectedType === 'activity'">
            <div class="d365-field-group">
              <label class="d365-field-label">Type</label>
              <select class="d365-field-input" v-model="form.activityType">
                <option value="Task">Task</option>
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Meeting">Meeting</option>
              </select>
            </div>
            <div class="d365-field-group">
              <label class="d365-field-label">Subject *</label>
              <input class="d365-field-input" v-model="form.subject" placeholder="Activity subject" />
            </div>
            <div class="d365-field-group">
              <label class="d365-field-label">Contact</label>
              <select class="d365-field-input" v-model="form.contactId">
                <option value="">-- Select --</option>
                <option v-for="c in contacts" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="d365-field-group">
              <label class="d365-field-label">Due Date</label>
              <input class="d365-field-input" type="date" v-model="form.dueDate" />
            </div>
          </template>

          <!-- Quote Quick Fields -->
          <template v-if="selectedType === 'quote'">
            <div class="d365-field-group">
              <label class="d365-field-label">Contact *</label>
              <select class="d365-field-input" v-model="form.contactId">
                <option value="">-- Select --</option>
                <option v-for="c in contacts" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="d365-field-group">
              <label class="d365-field-label">Notes</label>
              <textarea class="d365-field-input" v-model="form.notes" rows="3" placeholder="Additional notes..."></textarea>
            </div>
          </template>
        </div>

        <div class="panel-footer">
          <button class="btn-secondary" @click="close">Cancel</button>
          <button class="btn-primary" @click="save" :disabled="!isValid">Save</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'QuickCreate',
  props: {
    show: { type: Boolean, default: false },
    initialType: { type: String, default: 'contact' },
    contextContactId: { type: String, default: '' },
    contextOpportunityId: { type: String, default: '' }
  },
  data() {
    return {
      selectedType: this.initialType,
      form: this.getDefaultForm()
    }
  },
  computed: {
    ...mapGetters('contacts', { contacts: 'allContacts' }),
    typeLabel() {
      const labels = { contact: 'Contact', opportunity: 'Opportunity', activity: 'Activity', quote: 'Quote' }
      return labels[this.selectedType] || 'Record'
    },
    isValid() {
      switch (this.selectedType) {
        case 'contact': return !!this.form.name
        case 'opportunity': return !!this.form.name
        case 'activity': return !!this.form.subject
        case 'quote': return !!this.form.contactId
        default: return false
      }
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.selectedType = this.initialType
        this.form = this.getDefaultForm()
        if (this.contextContactId) this.form.contactId = this.contextContactId
      }
    },
    selectedType() {
      this.form = this.getDefaultForm()
      if (this.contextContactId) this.form.contactId = this.contextContactId
    }
  },
  methods: {
    getDefaultForm() {
      return {
        type: 'Company',
        name: '',
        email: '',
        phone: '',
        businessRelation: 'Prospect',
        contactId: '',
        estimatedValue: 0,
        priority: 'Medium',
        activityType: 'Task',
        subject: '',
        dueDate: new Date().toISOString().slice(0, 10),
        notes: ''
      }
    },
    save() {
      if (!this.isValid) return
      const now = new Date().toISOString().slice(0, 10)
      let record

      switch (this.selectedType) {
        case 'contact':
          record = {
            id: 'CT-' + (Date.now() % 100000),
            type: this.form.type,
            name: this.form.name,
            firstName: '',
            lastName: '',
            companyId: null,
            email: this.form.email,
            phone: this.form.phone,
            mobile: '',
            address: { line1: '', city: '', state: '', postalCode: '', country: '' },
            website: '',
            industry: '',
            businessRelation: this.form.businessRelation,
            salesperson: 'SP-001',
            jobTitle: '',
            department: '',
            organizationLevel: '',
            mailingGroups: [],
            notes: '',
            createdAt: now,
            updatedAt: now
          }
          this.$store.dispatch('contacts/addContact', record)
          break

        case 'opportunity': {
          const contact = this.contacts.find(c => c.id === this.form.contactId)
          record = {
            id: 'OPP-' + (Date.now() % 100000),
            name: this.form.name,
            contactId: this.form.contactId,
            contactName: contact ? contact.name : '',
            salesperson: 'SP-001',
            salesCycle: 'Standard Sales',
            currentStage: 'Qualification',
            stageIndex: 1,
            estimatedValue: this.form.estimatedValue,
            estimatedCloseDate: '',
            probability: 10,
            status: 'Open',
            priority: this.form.priority,
            description: '',
            activities: [],
            createdAt: now,
            updatedAt: now
          }
          this.$store.dispatch('opportunities/addOpportunity', record)
          break
        }

        case 'activity':
          record = {
            id: 'ACT-' + (Date.now() % 100000),
            type: this.form.activityType,
            subject: this.form.subject,
            description: '',
            contactId: this.form.contactId,
            opportunityId: this.contextOpportunityId || '',
            salesperson: 'SP-001',
            dueDate: this.form.dueDate,
            completedDate: null,
            priority: 'Normal',
            status: 'Open',
            duration: 30,
            createdAt: now
          }
          this.$store.dispatch('activities/addActivity', record)
          break

        case 'quote': {
          const qContact = this.contacts.find(c => c.id === this.form.contactId)
          record = {
            id: 'SQ-' + (Date.now() % 100000),
            type: 'Quote',
            number: 'SQ-' + (Date.now() % 100000),
            contactId: this.form.contactId,
            contactName: qContact ? qContact.name : '',
            opportunityId: this.contextOpportunityId || '',
            status: 'Draft',
            lines: [],
            subtotal: 0,
            discountPercent: 0,
            taxPercent: 18,
            total: 0,
            validUntil: '',
            notes: this.form.notes,
            createdAt: now,
            updatedAt: now
          }
          this.$store.dispatch('sales/addDocument', record)
          break
        }
      }

      this.$store.dispatch('ui/showSuccess', {
        title: this.typeLabel + ' Created',
        message: 'Record has been created successfully.'
      })
      this.close()
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.quick-create-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1500;
  display: flex;
  justify-content: flex-end;
}
.quick-create-panel {
  width: 420px;
  max-width: 100vw;
  height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: -3.2px 0 7.2px rgba(0, 0, 0, 0.18);
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #EDEBE9;
}
.panel-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #323130;
  margin: 0;
}
.panel-close {
  background: none;
  border: none;
  color: #605E5C;
  cursor: pointer;
  padding: 4px;
}
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #EDEBE9;
}
.btn-primary {
  padding: 6px 20px;
  background: #0078D4;
  color: white;
  border: none;
  border-radius: 2px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}
.btn-primary:hover { background: #106EBE; }
.btn-primary:disabled { background: #C8C6C4; cursor: not-allowed; }
.btn-secondary {
  padding: 6px 20px;
  background: white;
  color: #323130;
  border: 1px solid #8A8886;
  border-radius: 2px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
}
.btn-secondary:hover { background: #F3F2F1; }

.slide-panel-enter-active { transition: all 0.25s ease; }
.slide-panel-leave-active { transition: all 0.2s ease; }
.slide-panel-enter .quick-create-panel,
.slide-panel-leave-to .quick-create-panel {
  transform: translateX(100%);
}
</style>
