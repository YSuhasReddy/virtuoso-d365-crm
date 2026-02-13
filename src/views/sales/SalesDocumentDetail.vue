<template>
  <div class="sales-doc-detail-view">
    <!-- Command Bar -->
    <div class="command-bar">
      <div class="command-bar-left">
        <button class="d365-cmd-btn primary" @click="editDocument">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M11.5 1.5l1 1-8 8H3v-1.5l8-8zM2 12h10v1H2v-1z"/></svg>
          <span>Edit</span>
        </button>
        <button
          v-if="document && document.status === 'Draft'"
          class="d365-cmd-btn"
          @click="sendDocument"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M1 1l12 6-12 6V8.5L8 7 1 5.5V1z"/></svg>
          <span>Send</span>
        </button>
        <button
          v-if="document && document.status === 'Sent' && docType === 'Quote'"
          class="d365-cmd-btn"
          @click="acceptDocument"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          <span>Accept</span>
        </button>
        <button
          v-if="document && document.status === 'Sent' && docType === 'Quote'"
          class="d365-cmd-btn"
          @click="rejectDocument"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3.5 2.086L7 5.586l3.5-3.5L11.914 3.5 8.414 7l3.5 3.5-1.414 1.414L7 8.414l-3.5 3.5L2.086 10.5l3.5-3.5-3.5-3.5L3.5 2.086z"/></svg>
          <span>Reject</span>
        </button>
        <span class="cmd-separator"></span>
        <button class="d365-cmd-btn" @click="handlePrint">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 1v3H1v8h3v3h8v-3h3V4h-3V1H4zm1 1h6v2H5V2zm7 4v5h-1v-2H5v2H4V6h8zm-7 4h4v3H5v-3z"/></svg>
          <span>Print</span>
        </button>
        <button class="d365-cmd-btn" @click="handlePreview">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3C4.5 3 1.5 5.5.5 8c1 2.5 4 5 7.5 5s6.5-2.5 7.5-5c-1-2.5-4-5-7.5-5zm0 8a3 3 0 110-6 3 3 0 010 6zm0-5a2 2 0 100 4 2 2 0 000-4z"/></svg>
          <span>Preview</span>
        </button>
        <span class="cmd-separator"></span>
        <button class="d365-cmd-btn" @click="confirmDelete">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M5 1h4v1H5V1zM2 3h10v1H2V3zm1 1v8a1 1 0 001 1h6a1 1 0 001-1V4H3z"/></svg>
          <span>Delete</span>
        </button>
        <button class="d365-cmd-btn" @click="goBack">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M8 2L4 7l4 5" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
          <span>Back to List</span>
        </button>
      </div>
      <div class="command-bar-right">
        <RecordNavigation
          v-if="sameTypeDocuments.length > 1"
          :current-index="currentDocIndex"
          :total-count="sameTypeDocuments.length"
          :entity-name="docType"
          :show-first-last="true"
          @navigate="handleRecordNavigate"
        />
      </div>
    </div>

    <div class="detail-layout">
      <div class="detail-main" :class="{ 'factbox-open': !factBoxCollapsed }">
        <div class="page-content">
          <Breadcrumb />

          <!-- Loading / Not Found -->
          <div v-if="!document" class="empty-state d365-card">
            <p>Document not found. It may have been deleted or the ID is invalid.</p>
            <button class="d365-cmd-btn primary" @click="goBack">Return to List</button>
          </div>

          <template v-if="document">
            <!-- Header Section -->
            <div class="doc-header">
              <div class="doc-header-left">
                <h1 class="page-title">{{ document.number }}</h1>
                <div class="doc-badges">
                  <StatusBadge :status="docType" />
                  <StatusBadge :status="document.status" />
                </div>
              </div>
            </div>

            <!-- Tab Bar -->
            <div class="d365-tabs">
              <button
                class="d365-tab"
                :class="{ active: activeTab === 'lines' }"
                @click="activeTab = 'lines'"
              >Lines</button>
              <button
                class="d365-tab"
                :class="{ active: activeTab === 'notes' }"
                @click="activeTab = 'notes'"
              >Notes</button>
            </div>

            <!-- General Info Section -->
            <div class="info-section d365-card">
              <div class="info-grid">
                <div class="info-field">
                  <span class="info-label">Contact</span>
                  <span class="info-value">
                    <router-link v-if="document.contactId" :to="'/contacts/' + document.contactId" class="cell-link">
                      {{ document.contactName || document.contactId }}
                    </router-link>
                    <span v-else class="text-muted">--</span>
                  </span>
                </div>
                <div class="info-field">
                  <span class="info-label">Opportunity</span>
                  <span class="info-value">
                    <router-link v-if="document.opportunityId" :to="'/opportunities/' + document.opportunityId" class="cell-link">
                      {{ opportunityName }}
                    </router-link>
                    <span v-else class="text-muted">--</span>
                  </span>
                </div>
                <div class="info-field">
                  <span class="info-label">Status</span>
                  <span class="info-value"><StatusBadge :status="document.status" /></span>
                </div>
                <div class="info-field">
                  <span class="info-label">Valid Until</span>
                  <span class="info-value">{{ document.validUntil | date || '--' }}</span>
                </div>
              </div>
            </div>

            <!-- Lines Tab Content -->
            <div v-if="activeTab === 'lines'" class="lines-section d365-card">
              <div class="section-header">
                <h2 class="section-title">Line Items</h2>
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
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(line, index) in document.lines" :key="line.id || index">
                      <td class="col-num">{{ index + 1 }}</td>
                      <td class="col-desc">{{ line.description }}</td>
                      <td class="col-qty">{{ line.quantity }}</td>
                      <td class="col-price">{{ line.unitPrice | currency }}</td>
                      <td class="col-disc">{{ line.discount || 0 }}%</td>
                      <td class="col-amount">{{ line.amount | currency }}</td>
                    </tr>
                    <tr v-if="!document.lines || document.lines.length === 0">
                      <td colspan="6" class="empty-lines">No line items</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Totals Section -->
              <div class="totals-section">
                <div class="totals-grid">
                  <div class="totals-row">
                    <span class="totals-label">Subtotal</span>
                    <span class="totals-value">{{ document.subtotal | currency }}</span>
                  </div>
                  <div class="totals-row">
                    <span class="totals-label">Discount</span>
                    <span class="totals-value">{{ document.discountPercent || 0 }}%</span>
                  </div>
                  <div class="totals-row">
                    <span class="totals-label">Tax</span>
                    <span class="totals-value">{{ document.taxPercent || 0 }}%</span>
                  </div>
                  <div class="totals-row totals-total">
                    <span class="totals-label">Total</span>
                    <span class="totals-value">{{ document.total | currency }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes Tab Content -->
            <div v-if="activeTab === 'notes'" class="notes-section d365-card">
              <div class="section-header">
                <h2 class="section-title">Notes</h2>
              </div>
              <div class="notes-body">
                <p v-if="document.notes">{{ document.notes }}</p>
                <p v-else class="text-muted">No notes available.</p>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- FactBox Right Panel -->
      <FactBox
        v-if="document"
        :sections="factBoxSections"
        :collapsed="factBoxCollapsed"
        @toggle="factBoxCollapsed = $event"
        @item-click="handleFactBoxClick"
      />
    </div>

    <!-- Document Print Preview Modal -->
    <DocumentPreview
      :show="showPreview"
      :document="document"
      @close="showPreview = false"
      @print="handlePrint"
    />

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Document"
      :message="'Are you sure you want to delete document ' + (document ? document.number : '') + '? This action cannot be undone.'"
      confirm-text="Delete"
      :danger="true"
      @confirm="deleteDoc"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import FactBox from '@/components/common/FactBox.vue'
import RecordNavigation from '@/components/common/RecordNavigation.vue'
import DocumentPreview from '@/components/common/DocumentPreview.vue'
import { generateDocumentPDF } from '@/utils/pdfGenerator'

export default {
  name: 'SalesDocumentDetail',
  components: { Breadcrumb, StatusBadge, ConfirmDialog, FactBox, RecordNavigation, DocumentPreview },
  data() {
    return {
      activeTab: 'lines',
      showDeleteDialog: false,
      showPreview: false,
      factBoxCollapsed: false
    }
  },
  computed: {
    ...mapGetters('sales', ['getDocumentById', 'allDocuments']),
    ...mapGetters('opportunities', ['getOpportunityById']),
    documentId() {
      return this.$route.params.id
    },
    routeType() {
      return this.$route.params.type || 'quotes'
    },
    docType() {
      const typeMap = { 'quotes': 'Quote', 'orders': 'Order', 'invoices': 'Invoice' }
      return typeMap[this.routeType] || 'Quote'
    },
    document() {
      if (!this.getDocumentById) return null
      return this.getDocumentById(this.documentId)
    },
    opportunityName() {
      if (!this.document || !this.document.opportunityId) return '--'
      const opp = this.getOpportunityById(this.document.opportunityId)
      return opp ? opp.name : this.document.opportunityId
    },
    sameTypeDocuments() {
      const type = this.docType
      return (this.allDocuments || []).filter(function (d) { return d.type === type })
    },
    currentDocIndex() {
      if (!this.document) return 0
      var id = this.documentId
      var idx = this.sameTypeDocuments.findIndex(function (d) { return d.id === id })
      return idx >= 0 ? idx : 0
    },
    factBoxSections() {
      if (!this.document) return []
      var doc = this.document
      var sections = [
        {
          id: 'doc-info',
          title: 'Document Info',
          icon: '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M2 1h8a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1zm1 2v1h6V3H3zm0 2v1h6V5H3zm0 2v1h4V7H3z"/></svg>',
          items: [
            { label: 'Type', value: this.docType, type: 'badge' },
            { label: 'Status', value: doc.status || 'Draft', type: 'badge' },
            { label: 'Created', value: doc.createdAt || null, type: 'date' }
          ]
        },
        {
          id: 'financials',
          title: 'Financials',
          icon: '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 1v10M3.5 3.5h5c.828 0 1.5.448 1.5 1s-.672 1-1.5 1h-5M3.5 5.5h4c.828 0 1.5.448 1.5 1s-.672 1-1.5 1h-4"/></svg>',
          items: [
            { label: 'Subtotal', value: doc.subtotal || 0, type: 'currency' },
            { label: 'Discount %', value: (doc.discountPercent || 0) + '%', type: 'text' },
            { label: 'Tax %', value: (doc.taxPercent || 0) + '%', type: 'text' },
            { label: 'Total', value: doc.total || 0, type: 'currency' }
          ]
        },
        {
          id: 'related',
          title: 'Related',
          icon: '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M4 1a3 3 0 100 6 3 3 0 000-6zM1 9c0-1.1.9-2 2-2h2a2 2 0 012 2v1H1V9zm7-6h3v1H8V3zm0 2h3v1H8V5zm0 2h2v1H8V7z"/></svg>',
          items: this.relatedItems
        }
      ]
      return sections
    },
    relatedItems() {
      if (!this.document) return []
      var items = []
      if (this.document.contactId) {
        items.push({
          label: 'Contact',
          value: this.document.contactName || this.document.contactId,
          type: 'link',
          link: '/contacts/' + this.document.contactId
        })
      } else {
        items.push({ label: 'Contact', value: '--', type: 'text' })
      }
      if (this.document.opportunityId) {
        items.push({
          label: 'Opportunity',
          value: this.opportunityName,
          type: 'link',
          link: '/opportunities/' + this.document.opportunityId
        })
      }
      return items
    }
  },
  methods: {
    ...mapActions('sales', ['updateDocument', 'deleteDocument']),
    editDocument() {
      this.$router.push('/sales/' + this.routeType + '/' + this.documentId + '?edit=true')
    },
    sendDocument() {
      this.updateDocument({ id: this.documentId, status: 'Sent' })
      this.$store.dispatch('ui/showInfo', { title: 'Sent', message: 'Document has been marked as Sent.' })
    },
    acceptDocument() {
      this.updateDocument({ id: this.documentId, status: 'Accepted' })
      this.$store.dispatch('ui/showInfo', { title: 'Accepted', message: 'Document has been accepted.' })
    },
    rejectDocument() {
      this.updateDocument({ id: this.documentId, status: 'Rejected' })
      this.$store.dispatch('ui/showInfo', { title: 'Rejected', message: 'Document has been rejected.' })
    },
    confirmDelete() {
      this.showDeleteDialog = true
    },
    deleteDoc() {
      this.deleteDocument(this.documentId)
      this.showDeleteDialog = false
      this.$store.dispatch('ui/showInfo', { title: 'Deleted', message: 'Document has been deleted.' })
      this.goBack()
    },
    goBack() {
      this.$router.push('/sales/' + this.routeType)
    },
    handleRecordNavigate(direction) {
      var docs = this.sameTypeDocuments
      var idx = this.currentDocIndex
      var targetIdx = idx

      if (direction === 'first') targetIdx = 0
      else if (direction === 'prev') targetIdx = Math.max(0, idx - 1)
      else if (direction === 'next') targetIdx = Math.min(docs.length - 1, idx + 1)
      else if (direction === 'last') targetIdx = docs.length - 1

      if (targetIdx !== idx && docs[targetIdx]) {
        this.$router.push('/sales/' + this.routeType + '/' + docs[targetIdx].id)
      }
    },
    handlePrint() {
      if (!this.document) return
      generateDocumentPDF(this.document)
    },
    handlePreview() {
      if (!this.document) return
      this.showPreview = true
    },
    handleFactBoxClick() {
      // Navigation is handled by FactBox component via item.link
    },
    handleRefresh() {
      // Refresh data from store
      this.$store.dispatch('sales/initSales')
      this.$store.dispatch('ui/showInfo', { title: 'Refreshed', message: 'Document data has been refreshed.' })
    },
    handleSave() {
      // Navigate to edit mode for saving
      this.editDocument()
    }
  },
  mounted() {
    this.$root.$on('shortcut-refresh', this.handleRefresh)
    this.$root.$on('shortcut-save', this.handleSave)
  },
  beforeDestroy() {
    this.$root.$off('shortcut-refresh', this.handleRefresh)
    this.$root.$off('shortcut-save', this.handleSave)
  }
}
</script>

<style scoped>
.sales-doc-detail-view {
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
.command-bar-right {
  display: flex;
  align-items: center;
}
.cmd-separator {
  display: inline-block;
  width: 1px;
  height: 24px;
  background: #EDEBE9;
  margin: 0 4px;
}

/* Detail Layout with FactBox */
.detail-layout {
  display: flex;
  min-height: calc(100vh - 88px);
}
.detail-main {
  flex: 1;
  min-width: 0;
}
.detail-main.factbox-open {
  margin-right: 0;
}

.page-content {
  padding: 0 24px 24px;
}

/* Header */
.doc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}
.doc-header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #323130;
  margin: 0;
}
.doc-badges {
  display: flex;
  gap: 8px;
}

/* Info Section */
.info-section {
  padding: 20px;
  margin-bottom: 16px;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 20px;
}
.info-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #605E5C;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.info-value {
  font-size: 14px;
  color: #323130;
}

/* Lines Section */
.lines-section {
  margin-bottom: 16px;
  overflow: hidden;
}
.section-header {
  padding: 14px 20px;
  border-bottom: 1px solid #EDEBE9;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #323130;
  margin: 0;
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
  padding: 10px 16px;
  text-align: left;
  font-weight: 600;
  color: #605E5C;
  background: #FAFAFA;
  border-bottom: 1px solid #EDEBE9;
}
.lines-table td {
  padding: 10px 16px;
  color: #323130;
  border-bottom: 1px solid #EDEBE9;
}
.col-num { width: 50px; text-align: center; }
.col-desc { min-width: 250px; }
.col-qty { width: 80px; text-align: right; }
.col-price { width: 120px; text-align: right; }
.col-disc { width: 100px; text-align: right; }
.col-amount { width: 130px; text-align: right; font-weight: 600; }
.lines-table th.col-qty,
.lines-table th.col-price,
.lines-table th.col-disc,
.lines-table th.col-amount {
  text-align: right;
}
.empty-lines {
  text-align: center;
  color: #A19F9D;
  padding: 24px 16px;
}

/* Totals Section */
.totals-section {
  padding: 16px 20px;
  border-top: 1px solid #EDEBE9;
  background: #FAFAFA;
}
.totals-grid {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  max-width: 300px;
  margin-left: auto;
}
.totals-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 4px 0;
  font-size: 13px;
}
.totals-label {
  color: #605E5C;
}
.totals-value {
  font-weight: 600;
  color: #323130;
  text-align: right;
}
.totals-total {
  border-top: 2px solid #323130;
  padding-top: 8px;
  margin-top: 4px;
}
.totals-total .totals-label {
  font-size: 15px;
  font-weight: 700;
  color: #323130;
}
.totals-total .totals-value {
  font-size: 15px;
  font-weight: 700;
  color: #0078D4;
}

/* Notes Section */
.notes-section {
  margin-bottom: 16px;
  overflow: hidden;
}
.notes-body {
  padding: 20px;
  font-size: 14px;
  color: #323130;
  line-height: 1.6;
}

/* Empty State */
.empty-state {
  padding: 48px;
  text-align: center;
  color: #605E5C;
}
.empty-state p {
  margin-bottom: 16px;
}

/* Links */
.cell-link {
  color: #0078D4;
  text-decoration: none;
}
.cell-link:hover {
  text-decoration: underline;
}
.text-muted {
  color: #A19F9D;
}

/* Responsive */
@media (max-width: 768px) {
  .detail-layout {
    flex-direction: column;
  }
  .page-content {
    padding: 0 12px 12px;
  }
  .info-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 480px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
