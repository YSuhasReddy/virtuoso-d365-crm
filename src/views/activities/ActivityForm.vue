<template>
  <div class="activity-form-view">
    <!-- Command Bar -->
    <div class="command-bar">
      <div class="command-bar-left">
        <button class="d365-cmd-btn primary" @click="handleSave" :disabled="saving">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M11 1H3a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V4l-1-3zm-1 11H4V8h6v4zM7 3h1v3H7V3z"/></svg>
          <span>{{ saving ? 'Saving...' : 'Save' }}</span>
        </button>
        <span class="cmd-separator"></span>
        <button class="d365-cmd-btn" @click="discard">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3.5 2.086L7 5.586l3.5-3.5L11.914 3.5 8.414 7l3.5 3.5-1.414 1.414L7 8.414l-3.5 3.5L2.086 10.5l3.5-3.5-3.5-3.5L3.5 2.086z"/></svg>
          <span>Discard</span>
        </button>
      </div>
    </div>

    <div class="page-content">
      <Breadcrumb />

      <h1 class="page-title">New Activity</h1>

      <!-- Saving Overlay -->
      <div v-if="saving" class="saving-overlay">
        <div class="saving-spinner"></div>
        <span class="saving-text">Saving activity...</span>
      </div>

      <div class="form-card d365-card">
        <div class="form-body">
          <div class="form-grid">
            <!-- Left Column -->
            <div class="form-column">
              <div class="d365-field-group">
                <label class="d365-field-label">Type <span class="required">*</span></label>
                <select
                  v-model="form.type"
                  class="d365-field-input"
                  title="Select the type of activity (Task, Call, Email, or Meeting)"
                >
                  <option value="">-- Select Type --</option>
                  <option value="Task">Task</option>
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                </select>
                <span v-if="errors.type" class="field-error">{{ errors.type }}</span>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Subject <span class="required">*</span></label>
                <input
                  v-model="form.subject"
                  type="text"
                  class="d365-field-input"
                  placeholder="Enter activity subject"
                  title="Brief description of what this activity is about"
                />
                <span v-if="errors.subject" class="field-error">{{ errors.subject }}</span>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Description</label>
                <textarea
                  v-model="form.description"
                  class="d365-field-input textarea"
                  rows="4"
                  placeholder="Enter description..."
                  title="Detailed description or notes for this activity"
                ></textarea>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Contact</label>
                <select
                  v-model="form.contactId"
                  class="d365-field-input"
                  title="Associate this activity with a contact"
                >
                  <option value="">-- Select Contact --</option>
                  <option v-for="c in personContacts" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Opportunity</label>
                <select
                  v-model="form.opportunityId"
                  class="d365-field-input"
                  title="Link this activity to an opportunity"
                >
                  <option value="">-- None --</option>
                  <option v-for="opp in allOpportunities" :key="opp.id" :value="opp.id">{{ opp.name }}</option>
                </select>
              </div>
            </div>

            <!-- Right Column -->
            <div class="form-column">
              <div class="d365-field-group">
                <label class="d365-field-label">Salesperson</label>
                <select
                  v-model="form.salesperson"
                  class="d365-field-input"
                  title="Assign a salesperson responsible for this activity"
                >
                  <option value="">-- Select Salesperson --</option>
                  <option v-for="sp in salespersons" :key="sp.id" :value="sp.id">{{ sp.name }}</option>
                </select>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Due Date</label>
                <input
                  v-model="form.dueDate"
                  type="date"
                  class="d365-field-input"
                  title="Date by which this activity should be completed"
                />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Priority</label>
                <select
                  v-model="form.priority"
                  class="d365-field-input"
                  title="Priority level of this activity"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Duration (minutes)</label>
                <input
                  v-model.number="form.duration"
                  type="number"
                  class="d365-field-input"
                  min="0"
                  placeholder="e.g. 30"
                  title="Estimated duration of this activity in minutes"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import salespersons from '@/data/salespersons'

export default {
  name: 'ActivityForm',
  components: { Breadcrumb },
  data() {
    return {
      saving: false,
      salespersons,
      form: {
        type: '',
        subject: '',
        description: '',
        contactId: '',
        opportunityId: '',
        salesperson: '',
        dueDate: '',
        priority: 'Normal',
        duration: 30
      },
      errors: {}
    }
  },
  computed: {
    ...mapGetters('contacts', ['allContacts']),
    ...mapGetters('opportunities', ['allOpportunities']),
    personContacts() {
      return this.allContacts.filter(c => c.type === 'Person')
    }
  },
  methods: {
    ...mapActions('activities', ['addActivity']),
    validate() {
      this.errors = {}
      if (!this.form.type) {
        this.errors.type = 'Activity type is required.'
      }
      if (!this.form.subject || !this.form.subject.trim()) {
        this.errors.subject = 'Subject is required.'
      }
      return Object.keys(this.errors).length === 0
    },
    async handleSave() {
      await this.saveActivity()
    },
    async saveActivity() {
      if (!this.validate()) return

      this.saving = true
      try {
        const now = new Date().toISOString()
        const id = 'ACT-' + (10000 + Math.floor(Math.random() * 90000))
        const dueDateISO = this.form.dueDate
          ? new Date(this.form.dueDate + 'T09:00:00Z').toISOString()
          : null

        const activity = {
          id,
          type: this.form.type,
          subject: this.form.subject.trim(),
          description: this.form.description.trim(),
          contactId: this.form.contactId || null,
          opportunityId: this.form.opportunityId || null,
          salesperson: this.form.salesperson || null,
          dueDate: dueDateISO,
          completedDate: null,
          priority: this.form.priority,
          status: 'Open',
          duration: this.form.duration || 0,
          createdAt: now
        }

        await this.addActivity(activity)
        this.$store.dispatch('ui/showInfo', { title: 'Success', message: 'Activity "' + activity.subject + '" has been created.' })
        this.$router.push('/activities')
      } catch (e) {
        console.error('Failed to save activity:', e)
      } finally {
        this.saving = false
      }
    },
    discard() {
      this.$router.push('/activities')
    }
  },
  mounted() {
    this.$root.$on('shortcut-save', this.handleSave)
  },
  beforeDestroy() {
    this.$root.$off('shortcut-save', this.handleSave)
  }
}
</script>

<style scoped>
.activity-form-view {
  min-height: 100%;
  position: relative;
}

.command-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background: white;
  border-bottom: 1px solid #EDEBE9;
}
.command-bar-left {
  display: flex;
  align-items: center;
  gap: 2px;
}
.cmd-separator {
  display: inline-block;
  width: 1px;
  height: 24px;
  background: #EDEBE9;
  margin: 0 4px;
}

.page-content {
  padding: 0 24px 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #323130;
  margin: 0 0 16px 0;
}

/* Saving Overlay */
.saving-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  gap: 12px;
}
.saving-spinner {
  width: 32px;
  height: 32px;
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
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.form-card {
  overflow: hidden;
}

.form-body {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.form-column {
  display: flex;
  flex-direction: column;
}

.required {
  color: #D13438;
}

.field-error {
  display: block;
  font-size: 12px;
  color: #D13438;
  margin-top: 4px;
}

.textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .page-content {
    padding: 0 12px 12px;
  }
}
</style>
