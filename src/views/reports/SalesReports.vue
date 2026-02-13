<template>
  <div class="reports-view">
    <!-- Command Bar -->
    <div class="command-bar">
      <div class="command-bar-left">
        <button class="d365-cmd-btn" @click="refreshData">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1a6 6 0 015.917 5H14l-3 3-3-3h1.917A4.002 4.002 0 003 7a4 4 0 007.874 1H12.92A6.002 6.002 0 017 13 6 6 0 017 1z"/></svg>
          <span>Refresh</span>
        </button>
        <span class="cmd-separator"></span>
        <button class="d365-cmd-btn" @click="printReport">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1h8v3h2a1 1 0 011 1v5a1 1 0 01-1 1h-2v2H3v-2H1a1 1 0 01-1-1V5a1 1 0 011-1h2V1zm1 1v2h6V2H4zm-1 7v3h8V9H3zm8-3a1 1 0 100 2 1 1 0 000-2z"/></svg>
          <span>Print</span>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="reports-content">
      <Breadcrumb :items="[{ label: 'Home', path: '/dashboard' }, { label: 'Reports & Analytics' }]" />

      <h1 class="page-title">Reports &amp; Analytics</h1>

      <!-- Date Range Filter -->
      <div class="date-filter-bar bg-white rounded shadow-sm border border-gray-200 p-4 mb-5">
        <div class="date-filter-row">
          <div class="date-filter-group">
            <label class="date-label">From</label>
            <input
              type="date"
              v-model="dateFrom"
              class="date-input"
            />
          </div>
          <div class="date-filter-group">
            <label class="date-label">To</label>
            <input
              type="date"
              v-model="dateTo"
              class="date-input"
            />
          </div>
          <button class="d365-cmd-btn primary" @click="applyDateFilter">Apply</button>
          <button class="d365-cmd-btn" @click="clearDateFilter">Clear</button>
          <div class="date-presets">
            <button
              v-for="preset in datePresets"
              :key="preset.label"
              class="preset-btn"
              :class="{ active: activePreset === preset.label }"
              @click="applyPreset(preset)"
            >{{ preset.label }}</button>
          </div>
        </div>
        <div v-if="effectiveDateFrom || effectiveDateTo" class="date-filter-info">
          Showing data from
          <strong>{{ effectiveDateFrom || 'beginning' }}</strong>
          to
          <strong>{{ effectiveDateTo || 'now' }}</strong>
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >{{ tab.label }}</button>
      </div>

      <!-- Tab 1: Sales Overview -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <!-- KPI Row -->
        <div class="kpi-row">
          <KpiCard
            label="Total Revenue"
            :value="overviewKpis.totalRevenue"
            format="currency"
            subtitle="Orders + Invoices"
          />
          <KpiCard
            label="Total Invoiced"
            :value="overviewKpis.totalInvoiced"
            format="currency"
            :subtitle="overviewKpis.invoiceCount + ' invoices'"
          />
          <KpiCard
            label="Avg Order Value"
            :value="overviewKpis.avgOrderValue"
            format="currency"
            :subtitle="overviewKpis.orderCount + ' orders'"
          />
          <KpiCard
            label="Conversion Rate"
            :value="overviewKpis.conversionRate"
            format="percent"
            subtitle="Quotes to Orders"
          />
        </div>

        <!-- Quote-to-Order Conversion -->
        <div class="bg-white rounded shadow-sm border border-gray-200 p-6 mb-5">
          <div class="section-header">
            <h2 class="section-title">Quote-to-Order Conversion</h2>
          </div>
          <div class="conversion-stats-row">
            <div class="conversion-stat">
              <div class="conv-number">{{ overviewKpis.totalQuotes }}</div>
              <div class="conv-label">Total Quotes</div>
            </div>
            <div class="conversion-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#A19F9D"><path d="M12 4l8 8-8 8-1.4-1.4L16.2 13H4v-2h12.2l-5.6-5.6z"/></svg>
            </div>
            <div class="conversion-stat">
              <div class="conv-number">{{ overviewKpis.acceptedQuotes }}</div>
              <div class="conv-label">Accepted</div>
            </div>
            <div class="conversion-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#A19F9D"><path d="M12 4l8 8-8 8-1.4-1.4L16.2 13H4v-2h12.2l-5.6-5.6z"/></svg>
            </div>
            <div class="conversion-stat">
              <div class="conv-number">{{ overviewKpis.orderCount }}</div>
              <div class="conv-label">Orders Created</div>
            </div>
            <div class="conversion-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#A19F9D"><path d="M12 4l8 8-8 8-1.4-1.4L16.2 13H4v-2h12.2l-5.6-5.6z"/></svg>
            </div>
            <div class="conversion-stat">
              <div class="conv-number">{{ overviewKpis.invoiceCount }}</div>
              <div class="conv-label">Invoiced</div>
            </div>
          </div>
          <div class="conversion-bar-visual">
            <div class="conv-bar conv-bar-quotes" :style="{ width: '100%' }">
              <span>Quotes ({{ overviewKpis.totalQuotes }})</span>
            </div>
            <div class="conv-bar conv-bar-accepted" :style="{ width: conversionBarWidth('accepted') }">
              <span>Accepted ({{ overviewKpis.acceptedQuotes }})</span>
            </div>
            <div class="conv-bar conv-bar-orders" :style="{ width: conversionBarWidth('orders') }">
              <span>Orders ({{ overviewKpis.orderCount }})</span>
            </div>
            <div class="conv-bar conv-bar-invoiced" :style="{ width: conversionBarWidth('invoiced') }">
              <span>Invoiced ({{ overviewKpis.invoiceCount }})</span>
            </div>
          </div>
        </div>

        <!-- Monthly Sales Summary -->
        <div class="bg-white rounded shadow-sm border border-gray-200 p-6 mb-5">
          <div class="section-header">
            <h2 class="section-title">Monthly Sales Summary</h2>
            <button class="d365-cmd-btn text-sm" @click="exportMonthlySummary">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0l4 4H7v4H5V4H2l4-4zM0 9h12v2H0V9z"/></svg>
              Export CSV
            </button>
          </div>
          <table class="report-table">
            <thead>
              <tr>
                <th>Month</th>
                <th class="text-right">Quotes</th>
                <th class="text-right">Quote Value</th>
                <th class="text-right">Orders</th>
                <th class="text-right">Order Value</th>
                <th class="text-right">Invoices</th>
                <th class="text-right">Invoice Value</th>
                <th class="text-right">Credit Memos</th>
                <th class="text-right">Net Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in monthlySummary" :key="row.month">
                <td class="font-semibold">{{ row.monthLabel }}</td>
                <td class="text-right">{{ row.quoteCount }}</td>
                <td class="text-right">{{ $filters.currency(row.quoteValue) }}</td>
                <td class="text-right">{{ row.orderCount }}</td>
                <td class="text-right">{{ $filters.currency(row.orderValue) }}</td>
                <td class="text-right">{{ row.invoiceCount }}</td>
                <td class="text-right">{{ $filters.currency(row.invoiceValue) }}</td>
                <td class="text-right">{{ row.creditMemoCount }}</td>
                <td class="text-right font-semibold">{{ $filters.currency(row.netRevenue) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="totals-row">
                <td class="font-semibold">Total</td>
                <td class="text-right font-semibold">{{ monthlyTotals.quoteCount }}</td>
                <td class="text-right font-semibold">{{ $filters.currency(monthlyTotals.quoteValue) }}</td>
                <td class="text-right font-semibold">{{ monthlyTotals.orderCount }}</td>
                <td class="text-right font-semibold">{{ $filters.currency(monthlyTotals.orderValue) }}</td>
                <td class="text-right font-semibold">{{ monthlyTotals.invoiceCount }}</td>
                <td class="text-right font-semibold">{{ $filters.currency(monthlyTotals.invoiceValue) }}</td>
                <td class="text-right font-semibold">{{ monthlyTotals.creditMemoCount }}</td>
                <td class="text-right font-semibold">{{ $filters.currency(monthlyTotals.netRevenue) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Tab 2: Sales by Customer -->
      <div v-if="activeTab === 'customer'" class="tab-content">
        <div class="bg-white rounded shadow-sm border border-gray-200 p-6 mb-5">
          <div class="section-header">
            <h2 class="section-title">Sales by Customer</h2>
            <button class="d365-cmd-btn text-sm" @click="exportCustomerReport">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0l4 4H7v4H5V4H2l4-4zM0 9h12v2H0V9z"/></svg>
              Export CSV
            </button>
          </div>
          <table class="report-table sortable-table">
            <thead>
              <tr>
                <th class="sortable-th" @click="sortCustomerBy('name')">
                  Customer Name
                  <span class="sort-icon" v-if="customerSort.field === 'name'">{{ customerSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortCustomerBy('quoteCount')">
                  # Quotes
                  <span class="sort-icon" v-if="customerSort.field === 'quoteCount'">{{ customerSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortCustomerBy('orderCount')">
                  # Orders
                  <span class="sort-icon" v-if="customerSort.field === 'orderCount'">{{ customerSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortCustomerBy('invoiceCount')">
                  # Invoices
                  <span class="sort-icon" v-if="customerSort.field === 'invoiceCount'">{{ customerSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortCustomerBy('totalRevenue')">
                  Total Revenue
                  <span class="sort-icon" v-if="customerSort.field === 'totalRevenue'">{{ customerSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th" @click="sortCustomerBy('lastActivityDate')">
                  Last Activity
                  <span class="sort-icon" v-if="customerSort.field === 'lastActivityDate'">{{ customerSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in sortedCustomerData"
                :key="row.contactId"
                :class="{ 'top-customer': index < 10 }"
              >
                <td>
                  <div class="customer-name-cell">
                    <span v-if="index < 10" class="top-badge">#{{ index + 1 }}</span>
                    <span class="font-semibold">{{ row.name }}</span>
                  </div>
                </td>
                <td class="text-right">{{ row.quoteCount }}</td>
                <td class="text-right">{{ row.orderCount }}</td>
                <td class="text-right">{{ row.invoiceCount }}</td>
                <td class="text-right font-semibold">{{ $filters.currency(row.totalRevenue) }}</td>
                <td>{{ $filters.date(row.lastActivityDate) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="sortedCustomerData.length === 0" class="empty-state">
            No customer data available for the selected date range.
          </div>
        </div>
      </div>

      <!-- Tab 3: Sales by Item -->
      <div v-if="activeTab === 'item'" class="tab-content">
        <div class="bg-white rounded shadow-sm border border-gray-200 p-6 mb-5">
          <div class="section-header">
            <h2 class="section-title">Sales by Item</h2>
            <button class="d365-cmd-btn text-sm" @click="exportItemReport">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0l4 4H7v4H5V4H2l4-4zM0 9h12v2H0V9z"/></svg>
              Export CSV
            </button>
          </div>
          <table class="report-table sortable-table">
            <thead>
              <tr>
                <th class="sortable-th" @click="sortItemBy('category')">
                  Category
                  <span class="sort-icon" v-if="itemSort.field === 'category'">{{ itemSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th" @click="sortItemBy('description')">
                  Item Description
                  <span class="sort-icon" v-if="itemSort.field === 'description'">{{ itemSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortItemBy('totalQty')">
                  Qty Sold
                  <span class="sort-icon" v-if="itemSort.field === 'totalQty'">{{ itemSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortItemBy('totalRevenue')">
                  Total Revenue
                  <span class="sort-icon" v-if="itemSort.field === 'totalRevenue'">{{ itemSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortItemBy('avgUnitPrice')">
                  Avg Unit Price
                  <span class="sort-icon" v-if="itemSort.field === 'avgUnitPrice'">{{ itemSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortItemBy('docCount')">
                  # Documents
                  <span class="sort-icon" v-if="itemSort.field === 'docCount'">{{ itemSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in sortedItemData" :key="row.description">
                <td>
                  <span class="item-category-badge" :class="'cat-' + row.categoryClass">{{ row.category }}</span>
                </td>
                <td class="font-semibold">{{ row.description }}</td>
                <td class="text-right">{{ row.totalQty }}</td>
                <td class="text-right font-semibold">{{ $filters.currency(row.totalRevenue) }}</td>
                <td class="text-right">{{ $filters.currency(row.avgUnitPrice) }}</td>
                <td class="text-right">{{ row.docCount }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="totals-row">
                <td colspan="2" class="font-semibold">Total</td>
                <td class="text-right font-semibold">{{ itemTotals.totalQty }}</td>
                <td class="text-right font-semibold">{{ $filters.currency(itemTotals.totalRevenue) }}</td>
                <td class="text-right"></td>
                <td class="text-right"></td>
              </tr>
            </tfoot>
          </table>
          <div v-if="sortedItemData.length === 0" class="empty-state">
            No item data available for the selected date range.
          </div>
        </div>
      </div>

      <!-- Tab 4: Sales by Salesperson -->
      <div v-if="activeTab === 'salesperson'" class="tab-content">
        <div class="bg-white rounded shadow-sm border border-gray-200 p-6 mb-5">
          <div class="section-header">
            <h2 class="section-title">Sales by Salesperson</h2>
            <button class="d365-cmd-btn text-sm" @click="exportSalespersonReport">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0l4 4H7v4H5V4H2l4-4zM0 9h12v2H0V9z"/></svg>
              Export CSV
            </button>
          </div>
          <table class="report-table sortable-table">
            <thead>
              <tr>
                <th class="sortable-th" @click="sortSpBy('name')">
                  Salesperson
                  <span class="sort-icon" v-if="spSort.field === 'name'">{{ spSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th" @click="sortSpBy('role')">
                  Role
                  <span class="sort-icon" v-if="spSort.field === 'role'">{{ spSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortSpBy('openCount')">
                  Open
                  <span class="sort-icon" v-if="spSort.field === 'openCount'">{{ spSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortSpBy('wonCount')">
                  Won
                  <span class="sort-icon" v-if="spSort.field === 'wonCount'">{{ spSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortSpBy('lostCount')">
                  Lost
                  <span class="sort-icon" v-if="spSort.field === 'lostCount'">{{ spSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortSpBy('pipelineValue')">
                  Pipeline Value
                  <span class="sort-icon" v-if="spSort.field === 'pipelineValue'">{{ spSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortSpBy('wonRevenue')">
                  Won Revenue
                  <span class="sort-icon" v-if="spSort.field === 'wonRevenue'">{{ spSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortSpBy('winRate')">
                  Win Rate %
                  <span class="sort-icon" v-if="spSort.field === 'winRate'">{{ spSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
                <th class="sortable-th text-right" @click="sortSpBy('avgDealSize')">
                  Avg Deal Size
                  <span class="sort-icon" v-if="spSort.field === 'avgDealSize'">{{ spSort.dir === 'asc' ? '\u25B2' : '\u25BC' }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in sortedSalespersonData" :key="row.id">
                <td class="font-semibold">{{ row.name }}</td>
                <td>{{ row.role }}</td>
                <td class="text-right">{{ row.openCount }}</td>
                <td class="text-right text-green-700 font-semibold">{{ row.wonCount }}</td>
                <td class="text-right text-red-600">{{ row.lostCount }}</td>
                <td class="text-right">{{ $filters.currency(row.pipelineValue) }}</td>
                <td class="text-right font-semibold">{{ $filters.currency(row.wonRevenue) }}</td>
                <td class="text-right">
                  <span class="win-rate-badge" :class="winRateClass(row.winRate)">{{ row.winRate }}%</span>
                </td>
                <td class="text-right">{{ $filters.currency(row.avgDealSize) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="totals-row">
                <td class="font-semibold" colspan="2">Total</td>
                <td class="text-right font-semibold">{{ spTotals.openCount }}</td>
                <td class="text-right font-semibold">{{ spTotals.wonCount }}</td>
                <td class="text-right font-semibold">{{ spTotals.lostCount }}</td>
                <td class="text-right font-semibold">{{ $filters.currency(spTotals.pipelineValue) }}</td>
                <td class="text-right font-semibold">{{ $filters.currency(spTotals.wonRevenue) }}</td>
                <td class="text-right font-semibold">{{ spTotals.winRate }}%</td>
                <td class="text-right font-semibold">{{ $filters.currency(spTotals.avgDealSize) }}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Salesperson Performance Bars -->
          <div class="sp-performance-visual mt-6">
            <h3 class="subsection-title">Won Revenue by Salesperson</h3>
            <div class="sp-perf-bars">
              <div
                v-for="row in sortedSalespersonData"
                :key="'bar-' + row.id"
                class="sp-perf-bar-row"
              >
                <div class="sp-perf-name">{{ row.name }}</div>
                <div class="sp-perf-bar-container">
                  <div
                    class="sp-perf-bar"
                    :style="{ width: spBarWidth(row.wonRevenue) }"
                  ></div>
                  <div
                    class="sp-perf-bar-target"
                    :style="{ width: spBarWidth(row.target) }"
                  ></div>
                </div>
                <div class="sp-perf-value">{{ $filters.currency(row.wonRevenue) }}</div>
              </div>
            </div>
            <div class="sp-perf-legend">
              <span class="legend-item"><span class="legend-swatch legend-actual"></span> Won Revenue</span>
              <span class="legend-item"><span class="legend-swatch legend-target"></span> Target</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 5: Pipeline Analysis -->
      <div v-if="activeTab === 'pipeline'" class="tab-content">
        <!-- Pipeline Value by Stage -->
        <div class="bg-white rounded shadow-sm border border-gray-200 p-6 mb-5">
          <div class="section-header">
            <h2 class="section-title">Pipeline Value by Stage</h2>
            <button class="d365-cmd-btn text-sm" @click="exportPipelineReport">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0l4 4H7v4H5V4H2l4-4zM0 9h12v2H0V9z"/></svg>
              Export CSV
            </button>
          </div>
          <table class="report-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th class="text-right"># Opportunities</th>
                <th class="text-right">Total Value</th>
                <th class="text-right">Avg Value</th>
                <th class="text-right">Weighted Value</th>
                <th style="width: 30%;">Distribution</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stage in pipelineByStage" :key="stage.name">
                <td>
                  <span class="stage-indicator" :style="{ background: stage.color }"></span>
                  <span class="font-semibold">{{ stage.name }}</span>
                </td>
                <td class="text-right">{{ stage.count }}</td>
                <td class="text-right font-semibold">{{ $filters.currency(stage.value) }}</td>
                <td class="text-right">{{ $filters.currency(stage.avgValue) }}</td>
                <td class="text-right">{{ $filters.currency(stage.weightedValue) }}</td>
                <td>
                  <div class="pipeline-dist-bar">
                    <div
                      class="pipeline-dist-fill"
                      :style="{ width: stage.barWidth, background: stage.color }"
                    ></div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="totals-row">
                <td class="font-semibold">Total Pipeline</td>
                <td class="text-right font-semibold">{{ pipelineTotals.count }}</td>
                <td class="text-right font-semibold">{{ $filters.currency(pipelineTotals.value) }}</td>
                <td class="text-right"></td>
                <td class="text-right font-semibold">{{ $filters.currency(pipelineTotals.weightedValue) }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Opportunity Aging -->
        <div class="bg-white rounded shadow-sm border border-gray-200 p-6 mb-5">
          <div class="section-header">
            <h2 class="section-title">Opportunity Aging</h2>
            <button class="d365-cmd-btn text-sm" @click="exportAgingReport">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0l4 4H7v4H5V4H2l4-4zM0 9h12v2H0V9z"/></svg>
              Export CSV
            </button>
          </div>
          <table class="report-table">
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Contact</th>
                <th>Stage</th>
                <th class="text-right">Value</th>
                <th class="text-right">Days in Stage</th>
                <th>Est. Close Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="opp in opportunityAging"
                :key="opp.id"
                :class="{ 'aging-warning': opp.daysInStage > 60, 'aging-critical': opp.daysInStage > 90 }"
              >
                <td class="font-semibold">{{ opp.name }}</td>
                <td>{{ opp.contactName }}</td>
                <td>
                  <span class="stage-indicator" :style="{ background: stageColor(opp.currentStage) }"></span>
                  {{ opp.currentStage }}
                </td>
                <td class="text-right">{{ $filters.currency(opp.estimatedValue) }}</td>
                <td class="text-right">
                  <span class="aging-badge" :class="agingClass(opp.daysInStage)">{{ opp.daysInStage }} days</span>
                </td>
                <td>{{ $filters.date(opp.estimatedCloseDate) }}</td>
                <td>
                  <span class="close-status" :class="opp.isOverdue ? 'status-overdue' : 'status-ontrack'">
                    {{ opp.isOverdue ? 'Overdue' : 'On Track' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="opportunityAging.length === 0" class="empty-state">
            No open opportunities for the selected date range.
          </div>
        </div>

        <!-- Win/Loss Ratio -->
        <div class="bg-white rounded shadow-sm border border-gray-200 p-6 mb-5">
          <div class="section-header">
            <h2 class="section-title">Win/Loss Analysis</h2>
          </div>
          <div class="win-loss-grid">
            <div class="wl-stat-card wl-won">
              <div class="wl-number">{{ winLossData.wonCount }}</div>
              <div class="wl-label">Won</div>
              <div class="wl-value">{{ $filters.currency(winLossData.wonValue) }}</div>
            </div>
            <div class="wl-stat-card wl-lost">
              <div class="wl-number">{{ winLossData.lostCount }}</div>
              <div class="wl-label">Lost</div>
              <div class="wl-value">{{ $filters.currency(winLossData.lostValue) }}</div>
            </div>
            <div class="wl-stat-card wl-open">
              <div class="wl-number">{{ winLossData.openCount }}</div>
              <div class="wl-label">Open</div>
              <div class="wl-value">{{ $filters.currency(winLossData.openValue) }}</div>
            </div>
            <div class="wl-stat-card wl-rate">
              <div class="wl-number">{{ winLossData.winRate }}%</div>
              <div class="wl-label">Win Rate</div>
              <div class="wl-value">of closed deals</div>
            </div>
          </div>
          <!-- Win/Loss visual bar -->
          <div class="wl-bar-visual">
            <div class="wl-bar-label">Win/Loss Ratio</div>
            <div class="wl-bar-container">
              <div class="wl-bar-won" :style="{ width: winLossBarWidth }"></div>
              <div class="wl-bar-lost" :style="{ width: lossBarWidth }"></div>
            </div>
            <div class="wl-bar-labels">
              <span class="wl-bar-pct-won">{{ winLossData.winRate }}% Won</span>
              <span class="wl-bar-pct-lost">{{ 100 - winLossData.winRate }}% Lost</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '../../components/common/Breadcrumb.vue'
import KpiCard from '../../components/common/KpiCard.vue'
import salespersons from '../../data/salespersons'

var STAGE_COLORS = {
  'Qualification': '#0078D4',
  'Development': '#8764B8',
  'Proposal': '#FFB900',
  'Negotiation': '#FF8C00',
  'Closed Won': '#107C10',
  'Closed Lost': '#D13438'
}

var STAGE_PROBABILITIES = {
  'Qualification': 10,
  'Development': 30,
  'Proposal': 55,
  'Negotiation': 75,
  'Closed Won': 100,
  'Closed Lost': 0
}

var MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function categorizeLineItem(description) {
  var desc = (description || '').toLowerCase()
  if (desc.indexOf('software license') !== -1 || desc.indexOf('license') !== -1) return 'Software License'
  if (desc.indexOf('consulting') !== -1) return 'Consulting'
  if (desc.indexOf('custom development') !== -1 || desc.indexOf('custom dev') !== -1) return 'Custom Development'
  if (desc.indexOf('implementation') !== -1) return 'Implementation'
  if (desc.indexOf('support contract') !== -1 || desc.indexOf('maintenance') !== -1) return 'Support & Maintenance'
  if (desc.indexOf('training') !== -1) return 'Training'
  if (desc.indexOf('cloud hosting') !== -1 || desc.indexOf('gpu compute') !== -1) return 'Cloud Hosting'
  if (desc.indexOf('data migration') !== -1) return 'Data Migration'
  if (desc.indexOf('hardware') !== -1) return 'Hardware'
  if (desc.indexOf('credit') !== -1) return 'Credit'
  return 'Other'
}

function categoryClass(category) {
  var map = {
    'Software License': 'license',
    'Consulting': 'consulting',
    'Custom Development': 'development',
    'Implementation': 'implementation',
    'Support & Maintenance': 'support',
    'Training': 'training',
    'Cloud Hosting': 'hosting',
    'Data Migration': 'migration',
    'Hardware': 'hardware',
    'Credit': 'credit'
  }
  return map[category] || 'other'
}

function escCsv(val) {
  var s = String(val == null ? '' : val)
  if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export default {
  name: 'SalesReports',
  components: { Breadcrumb, KpiCard },
  data: function () {
    return {
      activeTab: 'overview',
      tabs: [
        { id: 'overview', label: 'Sales Overview' },
        { id: 'customer', label: 'Sales by Customer' },
        { id: 'item', label: 'Sales by Item' },
        { id: 'salesperson', label: 'Sales by Salesperson' },
        { id: 'pipeline', label: 'Pipeline Analysis' }
      ],
      dateFrom: '',
      dateTo: '',
      effectiveDateFrom: '',
      effectiveDateTo: '',
      activePreset: '',
      customerSort: { field: 'totalRevenue', dir: 'desc' },
      itemSort: { field: 'totalRevenue', dir: 'desc' },
      spSort: { field: 'wonRevenue', dir: 'desc' },
      datePresets: [
        { label: 'Last 30 Days', days: 30 },
        { label: 'Last 90 Days', days: 90 },
        { label: 'This Year', days: -1 },
        { label: 'Last Year', days: -2 },
        { label: 'All Time', days: 0 }
      ]
    }
  },
  computed: {
    // =========================================================
    // Filtered base data
    // =========================================================
    filteredDocuments: function () {
      var docs = this.$store.state.sales.documents || []
      var from = this.effectiveDateFrom
      var to = this.effectiveDateTo
      if (!from && !to) return docs
      return docs.filter(function (d) {
        var dateStr = (d.createdAt || '').split('T')[0]
        if (from && dateStr < from) return false
        if (to && dateStr > to) return false
        return true
      })
    },

    filteredOpportunities: function () {
      var opps = this.$store.state.opportunities.all || []
      var from = this.effectiveDateFrom
      var to = this.effectiveDateTo
      if (!from && !to) return opps
      return opps.filter(function (o) {
        var dateStr = (o.createdAt || '').split('T')[0]
        if (from && dateStr < from) return false
        if (to && dateStr > to) return false
        return true
      })
    },

    filteredActivities: function () {
      var acts = this.$store.state.activities.all || []
      var from = this.effectiveDateFrom
      var to = this.effectiveDateTo
      if (!from && !to) return acts
      return acts.filter(function (a) {
        var dateStr = (a.dueDate || a.createdAt || '').split('T')[0]
        if (from && dateStr < from) return false
        if (to && dateStr > to) return false
        return true
      })
    },

    // =========================================================
    // Tab 1: Sales Overview KPIs
    // =========================================================
    overviewKpis: function () {
      var docs = this.filteredDocuments
      var quotes = docs.filter(function (d) { return d.type === 'Quote' })
      var orders = docs.filter(function (d) { return d.type === 'Order' })
      var invoices = docs.filter(function (d) { return d.type === 'Invoice' })
      var creditMemos = docs.filter(function (d) { return d.type === 'Credit Memo' })

      var orderTotal = orders.reduce(function (sum, d) { return sum + (d.total || 0) }, 0)
      var invoiceTotal = invoices.reduce(function (sum, d) { return sum + (d.total || 0) }, 0)
      var creditTotal = creditMemos.reduce(function (sum, d) { return sum + (d.total || 0) }, 0)

      var totalRevenue = orderTotal + invoiceTotal - creditTotal
      var avgOrderValue = orders.length > 0 ? Math.round(orderTotal / orders.length) : 0
      var acceptedQuotes = quotes.filter(function (q) { return q.status === 'Accepted' }).length
      var conversionRate = quotes.length > 0 ? Math.round((acceptedQuotes / quotes.length) * 100) : 0

      return {
        totalRevenue: totalRevenue,
        totalInvoiced: invoiceTotal,
        avgOrderValue: avgOrderValue,
        conversionRate: conversionRate,
        totalQuotes: quotes.length,
        acceptedQuotes: acceptedQuotes,
        orderCount: orders.length,
        invoiceCount: invoices.length,
        creditMemoCount: creditMemos.length
      }
    },

    // =========================================================
    // Monthly Sales Summary
    // =========================================================
    monthlySummary: function () {
      var docs = this.filteredDocuments
      var monthMap = {}

      docs.forEach(function (doc) {
        var d = new Date(doc.createdAt)
        var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
        if (!monthMap[key]) {
          monthMap[key] = {
            month: key,
            monthLabel: MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear(),
            quoteCount: 0, quoteValue: 0,
            orderCount: 0, orderValue: 0,
            invoiceCount: 0, invoiceValue: 0,
            creditMemoCount: 0, creditMemoValue: 0,
            netRevenue: 0
          }
        }
        var row = monthMap[key]
        var total = doc.total || 0
        if (doc.type === 'Quote') { row.quoteCount++; row.quoteValue += total }
        else if (doc.type === 'Order') { row.orderCount++; row.orderValue += total }
        else if (doc.type === 'Invoice') { row.invoiceCount++; row.invoiceValue += total }
        else if (doc.type === 'Credit Memo') { row.creditMemoCount++; row.creditMemoValue += total }
      })

      var rows = Object.values(monthMap)
      rows.forEach(function (r) {
        r.netRevenue = r.orderValue + r.invoiceValue - r.creditMemoValue
      })

      rows.sort(function (a, b) { return a.month.localeCompare(b.month) })
      return rows
    },

    monthlyTotals: function () {
      var rows = this.monthlySummary
      return rows.reduce(function (totals, r) {
        totals.quoteCount += r.quoteCount
        totals.quoteValue += r.quoteValue
        totals.orderCount += r.orderCount
        totals.orderValue += r.orderValue
        totals.invoiceCount += r.invoiceCount
        totals.invoiceValue += r.invoiceValue
        totals.creditMemoCount += r.creditMemoCount
        totals.netRevenue += r.netRevenue
        return totals
      }, {
        quoteCount: 0, quoteValue: 0,
        orderCount: 0, orderValue: 0,
        invoiceCount: 0, invoiceValue: 0,
        creditMemoCount: 0, netRevenue: 0
      })
    },

    // =========================================================
    // Tab 2: Sales by Customer
    // =========================================================
    customerData: function () {
      var docs = this.filteredDocuments
      var activities = this.filteredActivities
      var customerMap = {}

      docs.forEach(function (doc) {
        var cId = doc.contactId
        if (!cId) return
        if (!customerMap[cId]) {
          customerMap[cId] = {
            contactId: cId,
            name: doc.contactName || cId,
            quoteCount: 0,
            orderCount: 0,
            invoiceCount: 0,
            totalRevenue: 0,
            lastActivityDate: ''
          }
        }
        var row = customerMap[cId]
        if (doc.type === 'Quote') row.quoteCount++
        else if (doc.type === 'Order') { row.orderCount++; row.totalRevenue += (doc.total || 0) }
        else if (doc.type === 'Invoice') { row.invoiceCount++; row.totalRevenue += (doc.total || 0) }
        else if (doc.type === 'Credit Memo') { row.totalRevenue -= (doc.total || 0) }
      })

      // Add last activity date
      activities.forEach(function (act) {
        var cId = act.contactId
        if (!cId || !customerMap[cId]) return
        var dateStr = act.dueDate || act.createdAt || ''
        if (dateStr > customerMap[cId].lastActivityDate) {
          customerMap[cId].lastActivityDate = dateStr
        }
      })

      return Object.values(customerMap)
    },

    sortedCustomerData: function () {
      var data = this.customerData.slice()
      var field = this.customerSort.field
      var dir = this.customerSort.dir === 'asc' ? 1 : -1
      data.sort(function (a, b) {
        var valA = a[field]
        var valB = b[field]
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
        if (valA == null) return 1
        if (valB == null) return -1
        if (valA < valB) return -1 * dir
        if (valA > valB) return 1 * dir
        return 0
      })
      return data
    },

    // =========================================================
    // Tab 3: Sales by Item
    // =========================================================
    itemData: function () {
      var docs = this.filteredDocuments
      var itemMap = {}

      docs.forEach(function (doc) {
        if (!doc.lines) return
        doc.lines.forEach(function (line) {
          var desc = (line.description || '').trim()
          // Normalize similar descriptions by taking core description
          var normalizedDesc = desc
          if (!itemMap[normalizedDesc]) {
            itemMap[normalizedDesc] = {
              description: desc,
              category: categorizeLineItem(desc),
              categoryClass: categoryClass(categorizeLineItem(desc)),
              totalQty: 0,
              totalRevenue: 0,
              totalUnitPrice: 0,
              priceEntries: 0,
              docIds: {},
              docCount: 0
            }
          }
          var row = itemMap[normalizedDesc]
          row.totalQty += (line.quantity || 0)
          row.totalRevenue += (line.amount || 0)
          row.totalUnitPrice += (line.unitPrice || 0)
          row.priceEntries++
          row.docIds[doc.id] = true
        })
      })

      return Object.values(itemMap).map(function (row) {
        return {
          description: row.description,
          category: row.category,
          categoryClass: row.categoryClass,
          totalQty: row.totalQty,
          totalRevenue: row.totalRevenue,
          avgUnitPrice: row.priceEntries > 0 ? Math.round(row.totalUnitPrice / row.priceEntries) : 0,
          docCount: Object.keys(row.docIds).length
        }
      })
    },

    sortedItemData: function () {
      var data = this.itemData.slice()
      var field = this.itemSort.field
      var dir = this.itemSort.dir === 'asc' ? 1 : -1
      data.sort(function (a, b) {
        var valA = a[field]
        var valB = b[field]
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
        if (valA == null) return 1
        if (valB == null) return -1
        if (valA < valB) return -1 * dir
        if (valA > valB) return 1 * dir
        return 0
      })
      return data
    },

    itemTotals: function () {
      var data = this.itemData
      return data.reduce(function (totals, r) {
        totals.totalQty += r.totalQty
        totals.totalRevenue += r.totalRevenue
        return totals
      }, { totalQty: 0, totalRevenue: 0 })
    },

    // =========================================================
    // Tab 4: Sales by Salesperson
    // =========================================================
    salespersonData: function () {
      var opps = this.filteredOpportunities
      var spMap = {}

      salespersons.forEach(function (sp) {
        spMap[sp.id] = {
          id: sp.id,
          name: sp.name,
          role: sp.role,
          target: sp.target || 0,
          openCount: 0,
          wonCount: 0,
          lostCount: 0,
          pipelineValue: 0,
          wonRevenue: 0,
          winRate: 0,
          avgDealSize: 0
        }
      })

      opps.forEach(function (opp) {
        var spId = opp.salesperson
        if (!spId || !spMap[spId]) return
        var row = spMap[spId]
        if (opp.status === 'Open') {
          row.openCount++
          row.pipelineValue += (opp.estimatedValue || 0)
        } else if (opp.status === 'Won') {
          row.wonCount++
          row.wonRevenue += (opp.estimatedValue || 0)
        } else if (opp.status === 'Lost') {
          row.lostCount++
        }
      })

      Object.values(spMap).forEach(function (row) {
        var closed = row.wonCount + row.lostCount
        row.winRate = closed > 0 ? Math.round((row.wonCount / closed) * 100) : 0
        row.avgDealSize = row.wonCount > 0 ? Math.round(row.wonRevenue / row.wonCount) : 0
      })

      return Object.values(spMap)
    },

    sortedSalespersonData: function () {
      var data = this.salespersonData.slice()
      var field = this.spSort.field
      var dir = this.spSort.dir === 'asc' ? 1 : -1
      data.sort(function (a, b) {
        var valA = a[field]
        var valB = b[field]
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
        if (valA == null) return 1
        if (valB == null) return -1
        if (valA < valB) return -1 * dir
        if (valA > valB) return 1 * dir
        return 0
      })
      return data
    },

    spTotals: function () {
      var data = this.salespersonData
      var totals = data.reduce(function (t, r) {
        t.openCount += r.openCount
        t.wonCount += r.wonCount
        t.lostCount += r.lostCount
        t.pipelineValue += r.pipelineValue
        t.wonRevenue += r.wonRevenue
        return t
      }, { openCount: 0, wonCount: 0, lostCount: 0, pipelineValue: 0, wonRevenue: 0, winRate: 0, avgDealSize: 0 })

      var closed = totals.wonCount + totals.lostCount
      totals.winRate = closed > 0 ? Math.round((totals.wonCount / closed) * 100) : 0
      totals.avgDealSize = totals.wonCount > 0 ? Math.round(totals.wonRevenue / totals.wonCount) : 0
      return totals
    },

    maxSpRevenue: function () {
      var spData = this.salespersonData
      var maxVal = 0
      spData.forEach(function (sp) {
        var candidate = Math.max(sp.wonRevenue, sp.target)
        if (candidate > maxVal) maxVal = candidate
      })
      return maxVal || 1
    },

    // =========================================================
    // Tab 5: Pipeline Analysis
    // =========================================================
    pipelineByStage: function () {
      var opps = this.filteredOpportunities.filter(function (o) { return o.status === 'Open' })
      var stages = ['Qualification', 'Development', 'Proposal', 'Negotiation']
      var maxValue = 0

      var result = stages.map(function (stageName) {
        var stageOpps = opps.filter(function (o) { return o.currentStage === stageName })
        var value = stageOpps.reduce(function (sum, o) { return sum + (o.estimatedValue || 0) }, 0)
        var prob = STAGE_PROBABILITIES[stageName] || 0
        if (value > maxValue) maxValue = value
        return {
          name: stageName,
          count: stageOpps.length,
          value: value,
          avgValue: stageOpps.length > 0 ? Math.round(value / stageOpps.length) : 0,
          weightedValue: Math.round(value * prob / 100),
          probability: prob,
          color: STAGE_COLORS[stageName] || '#0078D4'
        }
      })

      result.forEach(function (s) {
        s.barWidth = maxValue > 0 ? Math.max((s.value / maxValue) * 100, 3) + '%' : '3%'
      })

      return result
    },

    pipelineTotals: function () {
      var stages = this.pipelineByStage
      return stages.reduce(function (t, s) {
        t.count += s.count
        t.value += s.value
        t.weightedValue += s.weightedValue
        return t
      }, { count: 0, value: 0, weightedValue: 0 })
    },

    opportunityAging: function () {
      var opps = this.filteredOpportunities.filter(function (o) { return o.status === 'Open' })
      var now = new Date()
      var todayStr = now.toISOString().split('T')[0]

      return opps.map(function (opp) {
        var updatedDate = new Date(opp.updatedAt || opp.createdAt)
        var diffMs = now.getTime() - updatedDate.getTime()
        var daysInStage = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        var isOverdue = (opp.estimatedCloseDate || '') < todayStr

        return {
          id: opp.id,
          name: opp.name,
          contactName: opp.contactName,
          currentStage: opp.currentStage,
          estimatedValue: opp.estimatedValue,
          daysInStage: daysInStage,
          estimatedCloseDate: opp.estimatedCloseDate,
          isOverdue: isOverdue
        }
      }).sort(function (a, b) { return b.daysInStage - a.daysInStage })
    },

    winLossData: function () {
      var opps = this.filteredOpportunities
      var won = opps.filter(function (o) { return o.status === 'Won' })
      var lost = opps.filter(function (o) { return o.status === 'Lost' })
      var open = opps.filter(function (o) { return o.status === 'Open' })

      var wonCount = won.length
      var lostCount = lost.length
      var closed = wonCount + lostCount
      var winRate = closed > 0 ? Math.round((wonCount / closed) * 100) : 0

      return {
        wonCount: wonCount,
        wonValue: won.reduce(function (s, o) { return s + (o.estimatedValue || 0) }, 0),
        lostCount: lostCount,
        lostValue: lost.reduce(function (s, o) { return s + (o.estimatedValue || 0) }, 0),
        openCount: open.length,
        openValue: open.reduce(function (s, o) { return s + (o.estimatedValue || 0) }, 0),
        winRate: winRate
      }
    },

    winLossBarWidth: function () {
      return this.winLossData.winRate + '%'
    },

    lossBarWidth: function () {
      return (100 - this.winLossData.winRate) + '%'
    }
  },

  methods: {
    // =========================================================
    // Date filtering
    // =========================================================
    applyDateFilter: function () {
      this.effectiveDateFrom = this.dateFrom
      this.effectiveDateTo = this.dateTo
      this.activePreset = ''
    },

    clearDateFilter: function () {
      this.dateFrom = ''
      this.dateTo = ''
      this.effectiveDateFrom = ''
      this.effectiveDateTo = ''
      this.activePreset = ''
    },

    applyPreset: function (preset) {
      var now = new Date()
      var to = now.toISOString().split('T')[0]
      var from = ''

      if (preset.days === 0) {
        // All time
        this.dateFrom = ''
        this.dateTo = ''
        this.effectiveDateFrom = ''
        this.effectiveDateTo = ''
        this.activePreset = preset.label
        return
      } else if (preset.days === -1) {
        // This year
        from = now.getFullYear() + '-01-01'
      } else if (preset.days === -2) {
        // Last year
        var lastYear = now.getFullYear() - 1
        from = lastYear + '-01-01'
        to = lastYear + '-12-31'
      } else {
        var d = new Date(now)
        d.setDate(d.getDate() - preset.days)
        from = d.toISOString().split('T')[0]
      }

      this.dateFrom = from
      this.dateTo = to
      this.effectiveDateFrom = from
      this.effectiveDateTo = to
      this.activePreset = preset.label
    },

    // =========================================================
    // Sorting
    // =========================================================
    sortCustomerBy: function (field) {
      if (this.customerSort.field === field) {
        this.customerSort.dir = this.customerSort.dir === 'asc' ? 'desc' : 'asc'
      } else {
        this.customerSort.field = field
        this.customerSort.dir = 'desc'
      }
    },

    sortItemBy: function (field) {
      if (this.itemSort.field === field) {
        this.itemSort.dir = this.itemSort.dir === 'asc' ? 'desc' : 'asc'
      } else {
        this.itemSort.field = field
        this.itemSort.dir = 'desc'
      }
    },

    sortSpBy: function (field) {
      if (this.spSort.field === field) {
        this.spSort.dir = this.spSort.dir === 'asc' ? 'desc' : 'asc'
      } else {
        this.spSort.field = field
        this.spSort.dir = 'desc'
      }
    },

    // =========================================================
    // Visual helpers
    // =========================================================
    conversionBarWidth: function (type) {
      var kpis = this.overviewKpis
      var total = kpis.totalQuotes || 1
      var val = 0
      if (type === 'accepted') val = kpis.acceptedQuotes
      else if (type === 'orders') val = kpis.orderCount
      else if (type === 'invoiced') val = kpis.invoiceCount
      return Math.max((val / total) * 100, 5) + '%'
    },

    stageColor: function (stage) {
      return STAGE_COLORS[stage] || '#605E5C'
    },

    agingClass: function (days) {
      if (days > 90) return 'aging-critical-badge'
      if (days > 60) return 'aging-warning-badge'
      if (days > 30) return 'aging-moderate-badge'
      return 'aging-ok-badge'
    },

    winRateClass: function (rate) {
      if (rate >= 60) return 'rate-good'
      if (rate >= 40) return 'rate-moderate'
      return 'rate-low'
    },

    spBarWidth: function (value) {
      var max = this.maxSpRevenue
      return Math.max((value / max) * 100, 2) + '%'
    },

    // =========================================================
    // Data refresh
    // =========================================================
    refreshData: function () {
      this.$store.dispatch('contacts/initContacts')
      this.$store.dispatch('opportunities/initOpportunities')
      this.$store.dispatch('activities/initActivities')
      this.$store.dispatch('sales/initSales')
    },

    // =========================================================
    // Print
    // =========================================================
    printReport: function () {
      window.print()
    },

    // =========================================================
    // CSV Export
    // =========================================================
    exportToCsv: function (filename, headers, rows) {
      var csv = headers.map(escCsv).join(',') + '\n'
      rows.forEach(function (row) {
        csv += row.map(escCsv).join(',') + '\n'
      })
      var blob = new Blob([csv], { type: 'text/csv' })
      var link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
    },

    exportMonthlySummary: function () {
      var headers = ['Month', 'Quotes', 'Quote Value', 'Orders', 'Order Value', 'Invoices', 'Invoice Value', 'Credit Memos', 'Net Revenue']
      var rows = this.monthlySummary.map(function (r) {
        return [r.monthLabel, r.quoteCount, r.quoteValue.toFixed(2), r.orderCount, r.orderValue.toFixed(2), r.invoiceCount, r.invoiceValue.toFixed(2), r.creditMemoCount, r.netRevenue.toFixed(2)]
      })
      this.exportToCsv('monthly-sales-summary.csv', headers, rows)
    },

    exportCustomerReport: function () {
      var headers = ['Customer Name', '# Quotes', '# Orders', '# Invoices', 'Total Revenue', 'Last Activity']
      var rows = this.sortedCustomerData.map(function (r) {
        return [r.name, r.quoteCount, r.orderCount, r.invoiceCount, r.totalRevenue.toFixed(2), r.lastActivityDate ? new Date(r.lastActivityDate).toLocaleDateString() : '']
      })
      this.exportToCsv('sales-by-customer.csv', headers, rows)
    },

    exportItemReport: function () {
      var headers = ['Category', 'Item Description', 'Qty Sold', 'Total Revenue', 'Avg Unit Price', '# Documents']
      var rows = this.sortedItemData.map(function (r) {
        return [r.category, r.description, r.totalQty, r.totalRevenue.toFixed(2), r.avgUnitPrice.toFixed(2), r.docCount]
      })
      this.exportToCsv('sales-by-item.csv', headers, rows)
    },

    exportSalespersonReport: function () {
      var headers = ['Salesperson', 'Role', 'Open', 'Won', 'Lost', 'Pipeline Value', 'Won Revenue', 'Win Rate %', 'Avg Deal Size']
      var rows = this.sortedSalespersonData.map(function (r) {
        return [r.name, r.role, r.openCount, r.wonCount, r.lostCount, r.pipelineValue.toFixed(2), r.wonRevenue.toFixed(2), r.winRate, r.avgDealSize.toFixed(2)]
      })
      this.exportToCsv('sales-by-salesperson.csv', headers, rows)
    },

    exportPipelineReport: function () {
      var headers = ['Stage', '# Opportunities', 'Total Value', 'Avg Value', 'Weighted Value']
      var rows = this.pipelineByStage.map(function (s) {
        return [s.name, s.count, s.value.toFixed(2), s.avgValue.toFixed(2), s.weightedValue.toFixed(2)]
      })
      this.exportToCsv('pipeline-analysis.csv', headers, rows)
    },

    exportAgingReport: function () {
      var headers = ['Opportunity', 'Contact', 'Stage', 'Value', 'Days in Stage', 'Est. Close Date', 'Status']
      var rows = this.opportunityAging.map(function (o) {
        return [o.name, o.contactName, o.currentStage, o.estimatedValue.toFixed(2), o.daysInStage, o.estimatedCloseDate, o.isOverdue ? 'Overdue' : 'On Track']
      })
      this.exportToCsv('opportunity-aging.csv', headers, rows)
    }
  }
}
</script>

<style scoped>
/* =========================================================
   Base Layout
   ========================================================= */
.reports-view {
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

.reports-content {
  padding: 0 24px 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #323130;
  margin: 0 0 16px 0;
}

/* =========================================================
   Date Filter Bar
   ========================================================= */
.date-filter-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
.date-filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.date-label {
  font-size: 12px;
  font-weight: 600;
  color: #605E5C;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.date-input {
  padding: 6px 10px;
  border: 1px solid #8A8886;
  border-radius: 2px;
  font-size: 13px;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: #323130;
  background: white;
  height: 32px;
}
.date-input:focus {
  outline: none;
  border-color: #0078D4;
  box-shadow: 0 0 0 1px #0078D4;
}
.date-presets {
  display: flex;
  gap: 4px;
  margin-left: 8px;
}
.preset-btn {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #323130;
  background: #F3F2F1;
  border: 1px solid #EDEBE9;
  border-radius: 2px;
  cursor: pointer;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  transition: background 0.1s, border-color 0.1s;
  white-space: nowrap;
}
.preset-btn:hover {
  background: #EDEBE9;
}
.preset-btn.active {
  background: #0078D4;
  color: white;
  border-color: #0078D4;
}
.date-filter-info {
  margin-top: 8px;
  font-size: 12px;
  color: #605E5C;
}
.date-filter-info strong {
  color: #323130;
}

/* =========================================================
   Tab Bar (D365-style)
   ========================================================= */
.tab-bar {
  display: flex;
  border-bottom: 1px solid #EDEBE9;
  margin-bottom: 20px;
  overflow-x: auto;
}
.tab-btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 400;
  color: #605E5C;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  transition: color 0.15s, border-color 0.15s;
}
.tab-btn:hover {
  color: #323130;
}
.tab-btn.active {
  border-bottom: 2px solid #0078D4;
  color: #0078D4;
  font-weight: 600;
}

/* =========================================================
   KPI Row
   ========================================================= */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

/* =========================================================
   Section Header
   ========================================================= */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #323130;
  margin: 0;
}
.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
  margin: 0 0 12px 0;
}

/* =========================================================
   Report Tables
   ========================================================= */
.report-table {
  width: 100%;
  text-align: left;
  font-size: 13px;
  border-collapse: collapse;
}
.report-table thead th {
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #605E5C;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: #F9F9F8;
  border-bottom: 1px solid #EDEBE9;
  white-space: nowrap;
}
.report-table tbody td {
  padding: 10px 12px;
  color: #323130;
  border-bottom: 1px solid #EDEBE9;
  vertical-align: middle;
}
.report-table tbody tr:hover {
  background: #F9F9F8;
}
.report-table tfoot td {
  padding: 10px 12px;
  border-top: 2px solid #EDEBE9;
  background: #F9F9F8;
}
.totals-row {
  font-weight: 600;
}
.text-right { text-align: right; }
.text-center { text-align: center; }
.font-semibold { font-weight: 600; }
.text-sm { font-size: 12px; }
.mt-6 { margin-top: 24px; }
.mb-5 { margin-bottom: 20px; }

/* Sortable Headers */
.sortable-th {
  cursor: pointer;
  user-select: none;
  position: relative;
}
.sortable-th:hover {
  background: #F3F2F1;
}
.sort-icon {
  font-size: 10px;
  margin-left: 4px;
  color: #0078D4;
}

/* =========================================================
   Tab 1: Conversion Funnel
   ========================================================= */
.conversion-stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.conversion-stat {
  text-align: center;
  padding: 12px 20px;
  min-width: 100px;
}
.conv-number {
  font-size: 28px;
  font-weight: 700;
  color: #323130;
}
.conv-label {
  font-size: 12px;
  font-weight: 600;
  color: #605E5C;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.conversion-arrow {
  flex-shrink: 0;
}
.conversion-bar-visual {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.conv-bar {
  height: 28px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  transition: width 0.5s ease;
  min-width: 80px;
}
.conv-bar-quotes { background: #0078D4; }
.conv-bar-accepted { background: #8764B8; }
.conv-bar-orders { background: #FFB900; color: #323130; }
.conv-bar-invoiced { background: #107C10; }

/* =========================================================
   Tab 2: Customer Top Badge
   ========================================================= */
.customer-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.top-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #FFF4CE;
  color: #7A6920;
  font-size: 10px;
  font-weight: 700;
  border-radius: 50%;
  flex-shrink: 0;
}
.top-customer {
  background: #FFFCF0;
}

/* =========================================================
   Tab 3: Item Category Badges
   ========================================================= */
.item-category-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 2px;
  white-space: nowrap;
}
.cat-license { background: #DEECF9; color: #004578; }
.cat-consulting { background: #E8F5E9; color: #1B5E20; }
.cat-development { background: #F3E5F5; color: #4A148C; }
.cat-implementation { background: #FFF3E0; color: #E65100; }
.cat-support { background: #E0F2F1; color: #004D40; }
.cat-training { background: #FFF8E1; color: #F57F17; }
.cat-hosting { background: #E8EAF6; color: #1A237E; }
.cat-migration { background: #FCE4EC; color: #880E4F; }
.cat-hardware { background: #EFEBE9; color: #3E2723; }
.cat-credit { background: #FDE7E9; color: #A80000; }
.cat-other { background: #F3F2F1; color: #605E5C; }

/* =========================================================
   Tab 4: Win Rate Badge
   ========================================================= */
.win-rate-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 2px;
}
.rate-good { background: #DFF6DD; color: #107C10; }
.rate-moderate { background: #FFF4CE; color: #7A6920; }
.rate-low { background: #FDE7E9; color: #D13438; }

.text-green-700 { color: #107C10; }
.text-red-600 { color: #D13438; }

/* Salesperson Performance Bars */
.sp-perf-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sp-perf-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sp-perf-name {
  width: 140px;
  font-size: 13px;
  font-weight: 600;
  color: #323130;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sp-perf-bar-container {
  flex: 1;
  height: 24px;
  background: #F3F2F1;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}
.sp-perf-bar {
  height: 100%;
  background: #0078D4;
  border-radius: 2px;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.5s ease;
  z-index: 2;
}
.sp-perf-bar-target {
  height: 100%;
  background: #EDEBE9;
  border-right: 2px dashed #A19F9D;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
.sp-perf-value {
  font-size: 13px;
  font-weight: 600;
  color: #323130;
  min-width: 90px;
  text-align: right;
}
.sp-perf-legend {
  display: flex;
  gap: 20px;
  margin-top: 12px;
  font-size: 12px;
  color: #605E5C;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-swatch {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 2px;
}
.legend-actual { background: #0078D4; }
.legend-target { background: #EDEBE9; border: 1px dashed #A19F9D; }

/* =========================================================
   Tab 5: Pipeline Analysis
   ========================================================= */
.stage-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}
.pipeline-dist-bar {
  height: 20px;
  background: #F3F2F1;
  border-radius: 2px;
  overflow: hidden;
}
.pipeline-dist-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
  min-width: 3px;
}

/* Aging Badges */
.aging-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 2px;
}
.aging-ok-badge { background: #DFF6DD; color: #107C10; }
.aging-moderate-badge { background: #FFF4CE; color: #7A6920; }
.aging-warning-badge { background: #FFF4CE; color: #C87C0A; }
.aging-critical-badge { background: #FDE7E9; color: #D13438; }

.aging-warning td { background: #FFF9EF; }
.aging-critical td { background: #FFF5F5; }

.close-status {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 2px;
}
.status-ontrack { background: #DFF6DD; color: #107C10; }
.status-overdue { background: #FDE7E9; color: #D13438; }

/* Win/Loss Analysis */
.win-loss-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.wl-stat-card {
  text-align: center;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #EDEBE9;
}
.wl-number {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}
.wl-label {
  font-size: 13px;
  font-weight: 600;
  color: #605E5C;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 4px;
}
.wl-value {
  font-size: 13px;
  color: #605E5C;
  margin-top: 4px;
}
.wl-won { background: #F0FFF0; }
.wl-won .wl-number { color: #107C10; }
.wl-lost { background: #FFF5F5; }
.wl-lost .wl-number { color: #D13438; }
.wl-open { background: #F0F6FF; }
.wl-open .wl-number { color: #0078D4; }
.wl-rate { background: #F9F9F8; }
.wl-rate .wl-number { color: #323130; }

.wl-bar-visual {
  margin-top: 16px;
}
.wl-bar-label {
  font-size: 13px;
  font-weight: 600;
  color: #605E5C;
  margin-bottom: 8px;
}
.wl-bar-container {
  display: flex;
  height: 32px;
  border-radius: 2px;
  overflow: hidden;
}
.wl-bar-won {
  background: #107C10;
  transition: width 0.5s ease;
  min-width: 2px;
}
.wl-bar-lost {
  background: #D13438;
  transition: width 0.5s ease;
  min-width: 2px;
}
.wl-bar-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
}
.wl-bar-pct-won { color: #107C10; }
.wl-bar-pct-lost { color: #D13438; }

/* =========================================================
   Empty State
   ========================================================= */
.empty-state {
  padding: 32px;
  text-align: center;
  font-size: 14px;
  color: #A19F9D;
}

/* =========================================================
   Print Styles
   ========================================================= */
@media print {
  .command-bar,
  .date-filter-bar,
  .tab-bar,
  .d365-cmd-btn {
    display: none !important;
  }
  .tab-content {
    display: block !important;
  }
  .reports-content {
    padding: 0;
  }
  .bg-white {
    box-shadow: none !important;
    border: 1px solid #ddd !important;
    break-inside: avoid;
  }
}

/* =========================================================
   Responsive
   ========================================================= */
@media (max-width: 1024px) {
  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .win-loss-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .report-table {
    font-size: 12px;
  }
  .report-table thead th,
  .report-table tbody td,
  .report-table tfoot td {
    padding: 8px 8px;
  }
}
@media (max-width: 768px) {
  .kpi-row {
    grid-template-columns: 1fr;
  }
  .win-loss-grid {
    grid-template-columns: 1fr 1fr;
  }
  .reports-content {
    padding: 0 12px 12px;
  }
  .date-filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  .date-presets {
    margin-left: 0;
    flex-wrap: wrap;
  }
  .tab-bar {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .conversion-stats-row {
    flex-direction: column;
  }
  .conversion-arrow {
    transform: rotate(90deg);
  }
}
</style>
