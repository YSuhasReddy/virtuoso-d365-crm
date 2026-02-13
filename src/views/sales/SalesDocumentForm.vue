<template>
  <div class="sales-doc-form-view">
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

      <h1 class="page-title">{{ isEdit ? 'Edit' : 'New' }} {{ docTypeLabel }}</h1>

      <!-- Header Fields -->
      <div class="form-card d365-card">
        <div class="form-section-header">General Information</div>
        <div class="form-body">
          <div class="form-grid">
            <!-- Left Column -->
            <div class="form-column">
              <div class="d365-field-group">
                <label class="d365-field-label">Contact <span class="required">*</span></label>
                <select
                  v-model="form.contactId"
                  class="d365-field-input"
                  @change="onContactChange"
                  title="Select the primary contact for this document"
                >
                  <option value="">-- Select Contact --</option>
                  <option v-for="c in personContacts" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <span v-if="errors.contactId" class="field-error">{{ errors.contactId }}</span>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Opportunity</label>
                <select
                  v-model="form.opportunityId"
                  class="d365-field-input"
                  title="Link this document to an existing opportunity"
                >
                  <option value="">-- None --</option>
                  <option v-for="opp in allOpportunities" :key="opp.id" :value="opp.id">{{ opp.name }}</option>
                </select>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Status</label>
                <select
                  v-model="form.status"
                  class="d365-field-input"
                  title="Current status of this document"
                >
                  <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
            </div>

            <!-- Right Column -->
            <div class="form-column">
              <div class="d365-field-group">
                <label class="d365-field-label">Valid Until</label>
                <input
                  v-model="form.validUntil"
                  type="date"
                  class="d365-field-input"
                  title="Date until which this document remains valid"
                />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Notes</label>
                <textarea
                  v-model="form.notes"
                  class="d365-field-input textarea"
                  rows="4"
                  placeholder="Enter notes..."
                  title="Additional notes or remarks for this document"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Line Items Editor -->
      <div class="lines-card d365-card">
        <div class="form-section-header">
          <span>Line Items</span>
          <button class="d365-cmd-btn primary" @click="addLine">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
            <span>Add Line</span>
          </button>
        </div>
        <div class="lines-table-wrapper">
          <table class="lines-table">
            <thead>
              <tr>
                <th class="col-num">#</th>
                <th class="col-desc">Description</th>
                <th class="col-qty">Quantity</th>
                <th class="col-price">Unit Price</th>
                <th class="col-disc">Discount %</th>
                <th class="col-amount">Amount</th>
                <th class="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(line, index) in form.lines" :key="index">
                <td class="col-num">{{ index + 1 }}</td>
                <td class="col-desc">
                  <input
                    v-model="line.description"
                    type="text"
                    class="line-input"
                    placeholder="Enter description"
                    title="Description of the line item"
                  />
                </td>
                <td class="col-qty">
                  <input
                    v-model.number="line.quantity"
                    type="number"
                    class="line-input line-input-num"
                    min="0"
                    title="Quantity of items"
                    @input="recalculateLine(index)"
                  />
                </td>
                <td class="col-price">
                  <input
                    v-model.number="line.unitPrice"
                    type="number"
                    class="line-input line-input-num"
                    min="0"
                    step="0.01"
                    title="Price per unit"
                    @input="recalculateLine(index)"
                  />
                </td>
                <td class="col-disc">
                  <input
                    v-model.number="line.discount"
                    type="number"
                    class="line-input line-input-num"
                    min="0"
                    max="100"
                    title="Discount percentage for this line"
                    @input="recalculateLine(index)"
                  />
                </td>
                <td class="col-amount">
                  <span class="amount-display">{{ $filters.currency(line.amount) }}</span>
                </td>
                <td class="col-actions">
                  <button class="remove-btn" @click="removeLine(index)" title="Remove line">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M3 2.086L6 5.086l3-3L10.414 3.5 7.414 6.5l3 3-1.414 1.414L6 7.914l-3 3L1.586 9.5l3-3-3-3L3 2.086z"/>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr v-if="form.lines.length === 0">
                <td colspan="7" class="empty-lines">
                  No line items. Click "Add Line" to get started.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Totals Section -->
      <div class="totals-card d365-card">
        <div class="totals-body">
          <div class="totals-grid">
            <div class="totals-row">
              <span class="totals-label">Subtotal</span>
              <span class="totals-value">{{ $filters.currency(calculatedSubtotal) }}</span>
            </div>
            <div class="totals-row totals-editable">
              <span class="totals-label">Discount %</span>
              <input
                v-model.number="form.discountPercent"
                type="number"
                class="totals-input"
                min="0"
                max="100"
                title="Overall discount percentage applied to subtotal"
              />
            </div>
            <div class="totals-row totals-editable">
              <span class="totals-label">Tax %</span>
              <input
                v-model.number="form.taxPercent"
                type="number"
                class="totals-input"
                min="0"
                max="100"
                title="Tax percentage applied after discount"
              />
            </div>
            <div class="totals-row totals-total">
              <span class="totals-label">Total</span>
              <span class="totals-value">{{ $filters.currency(calculatedTotal) }}</span>
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
import eventBus from '../../utils/eventBus'

export default {
  name: 'SalesDocumentForm',
  components: { Breadcrumb },
  data() {
    return {
      saving: false,
      errors: {},
      form: {
        contactId: '',
        contactName: '',
        opportunityId: '',
        status: 'Draft',
        validUntil: '',
        notes: '',
        lines: [],
        discountPercent: 0,
        taxPercent: 18
      }
    }
  },
  computed: {
    ...mapGetters('contacts', ['allContacts', 'getContactById']),
    ...mapGetters('opportunities', ['allOpportunities']),
    ...mapGetters('sales', ['getDocumentById']),
    routeType() {
      return this.$route.params.type || 'quotes'
    },
    docType() {
      const typeMap = { 'quotes': 'Quote', 'orders': 'Order', 'invoices': 'Invoice' }
      return typeMap[this.routeType] || 'Quote'
    },
    docTypeLabel() {
      return this.docType
    },
    documentId() {
      return this.$route.params.id
    },
    isEdit() {
      return !!this.documentId && this.$route.query.edit === 'true'
    },
    personContacts() {
      return this.allContacts.filter(c => c.type === 'Person')
    },
    statusOptions() {
      const statusMap = {
        'Quote': ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'],
        'Order': ['Processing', 'Shipped', 'Delivered'],
        'Invoice': ['Unpaid', 'Paid', 'Overdue']
      }
      return statusMap[this.docType] || ['Draft']
    },
    calculatedSubtotal() {
      return this.form.lines.reduce((sum, line) => sum + (line.amount || 0), 0)
    },
    calculatedTotal() {
      let subtotal = this.calculatedSubtotal
      const discountAmount = subtotal * (this.form.discountPercent || 0) / 100
      const afterDiscount = subtotal - discountAmount
      const taxAmount = afterDiscount * (this.form.taxPercent || 0) / 100
      return afterDiscount + taxAmount
    }
  },
  methods: {
    ...mapActions('sales', ['addDocument', 'updateDocument']),
    addLine() {
      this.form.lines.push({
        id: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        amount: 0
      })
    },
    removeLine(index) {
      this.form.lines.splice(index, 1)
    },
    recalculateLine(index) {
      const line = this.form.lines[index]
      const qty = line.quantity || 0
      const price = line.unitPrice || 0
      const disc = line.discount || 0
      line.amount = qty * price * (1 - disc / 100)
    },
    onContactChange() {
      const contact = this.getContactById(this.form.contactId)
      this.form.contactName = contact ? contact.name : ''
    },
    validate() {
      this.errors = {}
      if (!this.form.contactId) {
        this.errors.contactId = 'Contact is required.'
      }
      return Object.keys(this.errors).length === 0
    },
    generateNumber() {
      const prefixMap = { 'Quote': 'SQ', 'Order': 'SO', 'Invoice': 'SI' }
      const prefix = prefixMap[this.docType] || 'SD'
      return prefix + '-' + (10000 + Math.floor(Math.random() * 90000))
    },
    async handleSave() {
      await this.saveDocument()
    },
    async saveDocument() {
      if (!this.validate()) return

      this.saving = true
      try {
        const now = new Date().toISOString()

        // Generate line IDs
        const lines = this.form.lines.map((line, index) => ({
          ...line,
          id: line.id || (this.generateNumber() + '-' + String(index + 1).padStart(2, '0'))
        }))

        if (this.isEdit && this.documentId) {
          // Update existing document
          const updatedDoc = {
            id: this.documentId,
            contactId: this.form.contactId,
            contactName: this.form.contactName,
            opportunityId: this.form.opportunityId || null,
            status: this.form.status,
            validUntil: this.form.validUntil || null,
            notes: this.form.notes,
            lines,
            subtotal: this.calculatedSubtotal,
            discountPercent: this.form.discountPercent,
            taxPercent: this.form.taxPercent,
            total: this.calculatedTotal,
            updatedAt: now
          }
          await this.updateDocument(updatedDoc)
          this.$store.dispatch('ui/showInfo', { title: 'Updated', message: this.docTypeLabel + ' has been updated.' })
          this.$router.push('/sales/' + this.routeType + '/' + this.documentId)
        } else {
          // Create new document
          const number = this.generateNumber()
          const newDoc = {
            id: number,
            type: this.docType,
            number,
            contactId: this.form.contactId,
            contactName: this.form.contactName,
            opportunityId: this.form.opportunityId || null,
            status: this.form.status,
            lines,
            subtotal: this.calculatedSubtotal,
            discountPercent: this.form.discountPercent,
            taxPercent: this.form.taxPercent,
            total: this.calculatedTotal,
            validUntil: this.form.validUntil || null,
            notes: this.form.notes,
            createdAt: now,
            updatedAt: now
          }
          await this.addDocument(newDoc)
          this.$store.dispatch('ui/showInfo', { title: 'Created', message: this.docTypeLabel + ' ' + number + ' has been created.' })
          this.$router.push('/sales/' + this.routeType + '/' + newDoc.id)
        }
      } catch (e) {
        console.error('Failed to save document:', e)
      } finally {
        this.saving = false
      }
    },
    discard() {
      if (this.isEdit && this.documentId) {
        this.$router.push('/sales/' + this.routeType + '/' + this.documentId)
      } else {
        this.$router.push('/sales/' + this.routeType)
      }
    },
    loadExistingDocument() {
      if (!this.isEdit || !this.documentId) return
      const doc = this.getDocumentById(this.documentId)
      if (!doc) return

      this.form.contactId = doc.contactId || ''
      this.form.contactName = doc.contactName || ''
      this.form.opportunityId = doc.opportunityId || ''
      this.form.status = doc.status || 'Draft'
      this.form.validUntil = doc.validUntil || ''
      this.form.notes = doc.notes || ''
      this.form.discountPercent = doc.discountPercent || 0
      this.form.taxPercent = doc.taxPercent != null ? doc.taxPercent : 18
      this.form.lines = (doc.lines || []).map(line => ({
        id: line.id || '',
        description: line.description || '',
        quantity: line.quantity || 0,
        unitPrice: line.unitPrice || 0,
        discount: line.discount || 0,
        amount: line.amount || 0
      }))
    }
  },
  created() {
    this.loadExistingDocument()
  },
  mounted() {
    eventBus.on('shortcut-save', this.handleSave)
  },
  beforeUnmount() {
    eventBus.off('shortcut-save', this.handleSave)
  },
  watch: {
    '$route.params.id': function () {
      this.loadExistingDocument()
    }
  }
}
</script>

<style scoped>
.sales-doc-form-view {
  min-height: 100%;
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

/* Form Card */
.form-card {
  margin-bottom: 16px;
  overflow: hidden;
}
.form-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #323130;
  background: #FAFAFA;
  border-bottom: 1px solid #EDEBE9;
}
.form-body {
  padding: 24px 20px;
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

/* Lines Card */
.lines-card {
  margin-bottom: 16px;
  overflow: hidden;
}
.lines-table-wrapper {
  overflow-x: auto;
}
.lines-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.lines-table th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  color: #605E5C;
  background: #FAFAFA;
  border-bottom: 1px solid #EDEBE9;
}
.lines-table td {
  padding: 6px 12px;
  border-bottom: 1px solid #EDEBE9;
  vertical-align: middle;
}
.col-num { width: 40px; text-align: center; }
.col-desc { min-width: 220px; }
.col-qty { width: 90px; }
.col-price { width: 120px; }
.col-disc { width: 100px; }
.col-amount { width: 130px; text-align: right; }
.col-actions { width: 40px; text-align: center; }
.lines-table th.col-qty,
.lines-table th.col-price,
.lines-table th.col-disc,
.lines-table th.col-amount {
  text-align: right;
}

.line-input {
  width: 100%;
  padding: 5px 8px;
  font-size: 13px;
  font-family: inherit;
  color: #323130;
  background: #FFFFFF;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  outline: none;
}
.line-input:focus {
  border-color: #0078D4;
}
.line-input-num {
  text-align: right;
}
.amount-display {
  font-weight: 600;
  color: #323130;
  display: block;
  text-align: right;
  padding-right: 4px;
}
.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 2px;
  color: #A19F9D;
  cursor: pointer;
}
.remove-btn:hover {
  background: #FDE7E9;
  color: #D13438;
}
.empty-lines {
  text-align: center;
  color: #A19F9D;
  padding: 24px 16px;
}

/* Totals Card */
.totals-card {
  margin-bottom: 24px;
  overflow: hidden;
}
.totals-body {
  padding: 20px;
}
.totals-grid {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  max-width: 320px;
  margin-left: auto;
}
.totals-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 0;
  font-size: 14px;
}
.totals-label {
  color: #605E5C;
  font-weight: 600;
}
.totals-value {
  font-weight: 600;
  color: #323130;
  text-align: right;
}
.totals-editable {
  gap: 16px;
}
.totals-input {
  width: 80px;
  padding: 4px 8px;
  font-size: 13px;
  font-family: inherit;
  color: #323130;
  background: #FFFFFF;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  outline: none;
  text-align: right;
}
.totals-input:focus {
  border-color: #0078D4;
}
.totals-total {
  border-top: 2px solid #323130;
  padding-top: 10px;
  margin-top: 6px;
}
.totals-total .totals-label {
  font-size: 16px;
  font-weight: 700;
  color: #323130;
}
.totals-total .totals-value {
  font-size: 16px;
  font-weight: 700;
  color: #0078D4;
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
