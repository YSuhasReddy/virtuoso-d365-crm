<template>
  <div class="opportunity-form">
    <!-- Breadcrumb -->
    <div class="page-header">
      <Breadcrumb :items="breadcrumbs" />
      <h1 class="page-title">{{ isEditMode ? 'Edit Opportunity' : 'New Opportunity' }}</h1>
    </div>

    <!-- Command Bar -->
    <CommandBar
      :actions="commandActions"
      :show-view-switcher="false"
      :show-filter="false"
      @save="handleSave"
      @save-close="handleSaveAndClose"
      @cancel="handleCancel"
    />

    <!-- Read-only BPF showing current stage context -->
    <BusinessProcessFlow
      :stages="bpfStages"
      :current-stage="form.currentStage"
      :completed-stages="formCompletedStages"
      :entity-status="'Open'"
    />

    <!-- Form Content -->
    <div class="form-card d365-card">
      <div class="form-section">
        <h3 class="section-title">Opportunity Information</h3>
        <div class="form-grid">
          <!-- Name -->
          <div class="d365-field-group form-full-width">
            <label class="d365-field-label" for="opp-name">Name <span class="required">*</span></label>
            <input
              id="opp-name"
              type="text"
              class="d365-field-input"
              :class="{ 'field-error': errors.name }"
              v-model="form.name"
              placeholder="Enter opportunity name"
              title="The name or title of this opportunity. This is a required field."
            />
            <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
          </div>

          <!-- Contact -->
          <div class="d365-field-group">
            <label class="d365-field-label" for="opp-contact">Contact</label>
            <select
              id="opp-contact"
              class="d365-field-input"
              v-model="form.contactId"
              @change="onContactChange"
              title="The primary contact associated with this opportunity."
            >
              <option value="">Select a contact</option>
              <option v-for="contact in contacts" :key="contact.id" :value="contact.id">{{ contact.name }}</option>
            </select>
          </div>

          <!-- Salesperson -->
          <div class="d365-field-group">
            <label class="d365-field-label" for="opp-salesperson">Salesperson</label>
            <select
              id="opp-salesperson"
              class="d365-field-input"
              v-model="form.salesperson"
              title="The salesperson or account manager responsible for this opportunity."
            >
              <option value="">Select a salesperson</option>
              <option v-for="sp in salespersons" :key="sp.id" :value="sp.id">{{ sp.name }}</option>
            </select>
          </div>

          <!-- Sales Cycle -->
          <div class="d365-field-group">
            <label class="d365-field-label" for="opp-cycle">Sales Cycle</label>
            <input
              id="opp-cycle"
              type="text"
              class="d365-field-input"
              v-model="form.salesCycle"
              placeholder="Standard Sales"
              title="The sales cycle or methodology being used for this opportunity."
            />
          </div>

          <!-- Current Stage -->
          <div class="d365-field-group">
            <label class="d365-field-label" for="opp-stage">Current Stage</label>
            <select
              id="opp-stage"
              class="d365-field-input"
              v-model="form.currentStage"
              @change="onStageChange"
              title="The current stage in the sales pipeline. Changing this will update the probability."
            >
              <option value="Qualification">Qualification</option>
              <option value="Development">Development</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
            </select>
          </div>

          <!-- Estimated Value -->
          <div class="d365-field-group">
            <label class="d365-field-label" for="opp-value">Estimated Value <span class="required">*</span></label>
            <input
              id="opp-value"
              type="number"
              class="d365-field-input"
              :class="{ 'field-error': errors.estimatedValue }"
              v-model.number="form.estimatedValue"
              placeholder="0.00"
              min="0"
              step="1000"
              title="The total estimated monetary value of this opportunity. This is a required field."
            />
            <span v-if="errors.estimatedValue" class="error-text">{{ errors.estimatedValue }}</span>
          </div>

          <!-- Estimated Close Date -->
          <div class="d365-field-group">
            <label class="d365-field-label" for="opp-close-date">Estimated Close Date</label>
            <input
              id="opp-close-date"
              type="date"
              class="d365-field-input"
              v-model="form.estimatedCloseDate"
              title="The expected date when this opportunity will be closed."
            />
          </div>

          <!-- Probability -->
          <div class="d365-field-group">
            <label class="d365-field-label" for="opp-probability">Probability (%)</label>
            <input
              id="opp-probability"
              type="number"
              class="d365-field-input"
              v-model.number="form.probability"
              placeholder="0"
              min="0"
              max="100"
              title="The likelihood of winning this opportunity, as a percentage (0-100). Auto-calculated from stage but can be overridden."
            />
            <span class="field-hint">Auto-calculated from stage. Override manually if needed.</span>
          </div>

          <!-- Priority -->
          <div class="d365-field-group">
            <label class="d365-field-label" for="opp-priority">Priority</label>
            <select
              id="opp-priority"
              class="d365-field-input"
              v-model="form.priority"
              title="The priority level of this opportunity. Used for sorting and focus."
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <!-- Description -->
          <div class="d365-field-group form-full-width">
            <label class="d365-field-label" for="opp-description">Description</label>
            <textarea
              id="opp-description"
              class="d365-field-input"
              v-model="form.description"
              placeholder="Describe the opportunity..."
              rows="4"
              title="Additional details and notes about this opportunity."
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CommandBar from '@/components/layout/CommandBar.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import BusinessProcessFlow from '@/components/common/BusinessProcessFlow.vue'
import salespersons from '@/data/salespersons'
import eventBus from '../../utils/eventBus'

var STAGE_PROBABILITIES = {
  'Qualification': 10,
  'Development': 30,
  'Proposal': 60,
  'Negotiation': 80
}

var STAGE_INDEX_MAP = {
  'Qualification': 1,
  'Development': 2,
  'Proposal': 3,
  'Negotiation': 4
}

export default {
  name: 'OpportunityForm',

  components: {
    CommandBar,
    Breadcrumb,
    BusinessProcessFlow
  },

  data() {
    return {
      salespersons: salespersons,
      form: {
        name: '',
        contactId: '',
        contactName: '',
        salesperson: '',
        salesCycle: 'Standard Sales',
        currentStage: 'Qualification',
        estimatedValue: null,
        estimatedCloseDate: '',
        probability: 10,
        priority: 'Medium',
        description: '',
        status: 'Open'
      },
      errors: {}
    }
  },

  computed: {
    ...mapGetters('opportunities', ['getOpportunityById']),
    ...mapGetters('contacts', { allContacts: 'allContacts' }),

    isEditMode: function () {
      return !!this.$route.params.id
    },

    existingOpportunity: function () {
      if (!this.isEditMode) return null
      return this.getOpportunityById(this.$route.params.id)
    },

    contacts: function () {
      return this.allContacts || []
    },

    breadcrumbs: function () {
      if (this.isEditMode) {
        return [
          { label: 'Home', path: '/dashboard' },
          { label: 'Opportunities', path: '/opportunities' },
          { label: this.existingOpportunity ? this.existingOpportunity.name : 'Edit', path: this.existingOpportunity ? '/opportunities/' + this.existingOpportunity.id : '/opportunities' },
          { label: 'Edit' }
        ]
      }
      return [
        { label: 'Home', path: '/dashboard' },
        { label: 'Opportunities', path: '/opportunities' },
        { label: 'New' }
      ]
    },

    commandActions: function () {
      return [
        {
          id: 'save',
          label: 'Save',
          event: 'save',
          primary: true,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4.414A1 1 0 0 0 14.707 4L12 1.293A1 1 0 0 0 11.293 1H2zm0 1h9.293L14 4.414V14H2V2z"/><path d="M8 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>'
        },
        {
          id: 'save-close',
          label: 'Save & Close',
          event: 'save-close',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 12.5L2 8l1.5-1.5L6.5 9.5 12.5 3.5 14 5l-7.5 7.5z"/></svg>'
        },
        {
          id: 'cancel',
          label: 'Cancel',
          event: 'cancel',
          extra: true,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>'
        }
      ]
    },

    // BPF stages for the read-only display
    bpfStages: function () {
      return [
        { id: 'Qualification', name: 'Qualification' },
        { id: 'Development', name: 'Development' },
        { id: 'Proposal', name: 'Proposal' },
        { id: 'Negotiation', name: 'Negotiation' },
        { id: 'Closed', name: 'Closed' }
      ]
    },

    formCompletedStages: function () {
      var stageOrder = ['Qualification', 'Development', 'Proposal', 'Negotiation', 'Closed']
      var currentIdx = stageOrder.indexOf(this.form.currentStage)
      if (currentIdx <= 0) return []
      return stageOrder.slice(0, currentIdx)
    }
  },

  created: function () {
    if (this.isEditMode && this.existingOpportunity) {
      this.populateForm(this.existingOpportunity)
    }
  },

  mounted: function () {
    var self = this
    this._shortcutSave = function () {
      self.handleSave()
    }
    eventBus.on('shortcut-save', this._shortcutSave)
  },

  beforeUnmount: function () {
    eventBus.off('shortcut-save', this._shortcutSave)
  },

  watch: {
    existingOpportunity: function (opp) {
      if (opp && this.isEditMode) {
        this.populateForm(opp)
      }
    }
  },

  methods: {
    ...mapActions('opportunities', ['addOpportunity', 'updateOpportunity']),

    populateForm: function (opp) {
      this.form = {
        name: opp.name || '',
        contactId: opp.contactId || '',
        contactName: opp.contactName || '',
        salesperson: opp.salesperson || '',
        salesCycle: opp.salesCycle || 'Standard Sales',
        currentStage: opp.currentStage || 'Qualification',
        estimatedValue: opp.estimatedValue || null,
        estimatedCloseDate: opp.estimatedCloseDate || '',
        probability: opp.probability != null ? opp.probability : 10,
        priority: opp.priority || 'Medium',
        description: opp.description || '',
        status: opp.status || 'Open'
      }
    },

    onContactChange: function () {
      var contact = this.contacts.find(function (c) { return c.id === this.form.contactId }.bind(this))
      this.form.contactName = contact ? contact.name : ''
    },

    onStageChange: function () {
      var prob = STAGE_PROBABILITIES[this.form.currentStage]
      if (prob !== undefined) {
        this.form.probability = prob
      }
    },

    validate: function () {
      this.errors = {}

      if (!this.form.name || !this.form.name.trim()) {
        this.errors.name = 'Opportunity name is required.'
      }

      if (this.form.estimatedValue == null || this.form.estimatedValue === '' || this.form.estimatedValue < 0) {
        this.errors.estimatedValue = 'Estimated value is required and must be a positive number.'
      }

      return Object.keys(this.errors).length === 0
    },

    handleSave: function () {
      if (!this.validate()) return

      if (this.isEditMode) {
        this.updateOpportunity({
          id: this.$route.params.id,
          name: this.form.name,
          contactId: this.form.contactId,
          contactName: this.form.contactName,
          salesperson: this.form.salesperson,
          salesCycle: this.form.salesCycle,
          currentStage: this.form.currentStage,
          estimatedValue: this.form.estimatedValue,
          estimatedCloseDate: this.form.estimatedCloseDate,
          probability: this.form.probability,
          priority: this.form.priority,
          description: this.form.description,
          status: this.form.status,
          stageIndex: STAGE_INDEX_MAP[this.form.currentStage] || 1
        })
      } else {
        var newId = 'OPP-' + (10000 + Math.floor(Math.random() * 90000))
        this.addOpportunity({
          id: newId,
          name: this.form.name,
          contactId: this.form.contactId,
          contactName: this.form.contactName,
          salesperson: this.form.salesperson,
          salesCycle: this.form.salesCycle,
          currentStage: this.form.currentStage,
          estimatedValue: this.form.estimatedValue,
          estimatedCloseDate: this.form.estimatedCloseDate,
          probability: this.form.probability,
          priority: this.form.priority,
          description: this.form.description,
          status: this.form.status,
          stageIndex: STAGE_INDEX_MAP[this.form.currentStage] || 1,
          activities: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        this.$router.push('/opportunities/' + newId)
      }
    },

    handleSaveAndClose: function () {
      if (!this.validate()) return

      if (this.isEditMode) {
        this.updateOpportunity({
          id: this.$route.params.id,
          name: this.form.name,
          contactId: this.form.contactId,
          contactName: this.form.contactName,
          salesperson: this.form.salesperson,
          salesCycle: this.form.salesCycle,
          currentStage: this.form.currentStage,
          estimatedValue: this.form.estimatedValue,
          estimatedCloseDate: this.form.estimatedCloseDate,
          probability: this.form.probability,
          priority: this.form.priority,
          description: this.form.description,
          status: this.form.status,
          stageIndex: STAGE_INDEX_MAP[this.form.currentStage] || 1
        })
        this.$router.push('/opportunities/' + this.$route.params.id)
      } else {
        var newId = 'OPP-' + (10000 + Math.floor(Math.random() * 90000))
        this.addOpportunity({
          id: newId,
          name: this.form.name,
          contactId: this.form.contactId,
          contactName: this.form.contactName,
          salesperson: this.form.salesperson,
          salesCycle: this.form.salesCycle,
          currentStage: this.form.currentStage,
          estimatedValue: this.form.estimatedValue,
          estimatedCloseDate: this.form.estimatedCloseDate,
          probability: this.form.probability,
          priority: this.form.priority,
          description: this.form.description,
          status: this.form.status,
          stageIndex: STAGE_INDEX_MAP[this.form.currentStage] || 1,
          activities: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        this.$router.push('/opportunities/' + newId)
      }
    },

    handleCancel: function () {
      if (this.isEditMode) {
        this.$router.push('/opportunities/' + this.$route.params.id)
      } else {
        this.$router.push('/opportunities')
      }
    }
  }
}
</script>

<style scoped>
.opportunity-form {
  padding: 0 24px 24px;
}

.page-header {
  padding: 16px 0 8px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #323130;
  margin: 4px 0 12px;
}

/* Form Card */
.form-card {
  padding: 0;
  margin-top: 4px;
}

.form-section {
  padding: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #323130;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #EDEBE9;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-full-width {
  grid-column: 1 / -1;
}

/* Required indicator */
.required {
  color: #D13438;
}

/* Error styling */
.field-error {
  border-color: #D13438 !important;
}
.error-text {
  font-size: 12px;
  color: #D13438;
  margin-top: 4px;
  display: block;
}

/* Field hint */
.field-hint {
  font-size: 11px;
  color: #A19F9D;
  margin-top: 4px;
  display: block;
}

/* Textarea */
textarea.d365-field-input {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  line-height: 1.5;
}
</style>
