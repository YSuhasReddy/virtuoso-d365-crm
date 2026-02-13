/**
 * PDF Generation Utility for Sales Documents
 * Generates styled HTML documents for browser print-to-PDF workflow.
 * Supports Quotes, Sales Orders, Invoices, and Credit Memos.
 */

var DOC_TYPE_CONFIG = {
  Quote: { label: 'QUOTE', color: '#0078D4' },
  Order: { label: 'SALES ORDER', color: '#8764B8' },
  Invoice: { label: 'INVOICE', color: '#107C10' },
  'Credit Memo': { label: 'CREDIT MEMO', color: '#D13438' }
}

/**
 * Format a number as USD currency with commas and 2 decimal places
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
  return '$' + (value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Format an ISO date string into a readable format like "February 12, 2026"
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return '-'
  var d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Build the complete printable HTML for a sales document
 * @param {Object} doc - The sales document object
 * @param {Object} config - Company/branding configuration
 * @returns {string} Complete HTML document string
 */
function buildDocumentHTML(doc, config) {
  var typeConfig = DOC_TYPE_CONFIG[doc.type] || DOC_TYPE_CONFIG.Quote
  var lines = doc.lines || []
  var now = new Date()
  var generatedAt = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) +
    ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  // Build line item rows
  var lineRows = ''
  if (lines.length === 0) {
    lineRows = '<tr><td colspan="6" style="text-align:center;padding:24px 16px;color:#A19F9D;font-style:italic;">No line items</td></tr>'
  } else {
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i]
      var bgColor = i % 2 === 1 ? '#F8F8F8' : '#FFFFFF'
      lineRows += '<tr style="background:' + bgColor + ';">' +
        '<td style="padding:10px 16px;border-bottom:1px solid #E8E8E8;text-align:center;color:#605E5C;">' + (i + 1) + '</td>' +
        '<td style="padding:10px 16px;border-bottom:1px solid #E8E8E8;color:#323130;">' + (line.description || '') + '</td>' +
        '<td style="padding:10px 16px;border-bottom:1px solid #E8E8E8;text-align:right;color:#323130;">' + (line.quantity || 0) + '</td>' +
        '<td style="padding:10px 16px;border-bottom:1px solid #E8E8E8;text-align:right;color:#323130;">' + formatCurrency(line.unitPrice) + '</td>' +
        '<td style="padding:10px 16px;border-bottom:1px solid #E8E8E8;text-align:right;color:#323130;">' + (line.discount || 0) + '%</td>' +
        '<td style="padding:10px 16px;border-bottom:1px solid #E8E8E8;text-align:right;font-weight:600;color:#323130;">' + formatCurrency(line.amount) + '</td>' +
        '</tr>'
    }
  }

  // Valid Until row (only for Quotes)
  var validUntilRow = ''
  if (doc.type === 'Quote' && doc.validUntil) {
    validUntilRow = '<tr>' +
      '<td style="padding:6px 12px;font-size:12px;color:#605E5C;font-weight:600;border-bottom:1px solid #F0F0F0;">Valid Until</td>' +
      '<td style="padding:6px 12px;font-size:12px;color:#323130;border-bottom:1px solid #F0F0F0;">' + formatDate(doc.validUntil) + '</td>' +
      '</tr>'
  }

  // Notes section
  var notesSection = ''
  if (doc.notes) {
    notesSection = '<div style="margin-top:24px;padding:16px 20px;background:#FAFAFA;border:1px solid #E8E8E8;border-radius:4px;">' +
      '<div style="font-size:12px;font-weight:600;color:#605E5C;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Notes</div>' +
      '<div style="font-size:13px;color:#323130;line-height:1.6;white-space:pre-wrap;">' + doc.notes + '</div>' +
      '</div>'
  }

  // Company address with line breaks
  var addressHtml = (config.companyAddress || '').replace(/\n/g, '<br>')

  var html = '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>' + typeConfig.label + ' - ' + (doc.number || '') + '</title>' +
    '<style>' +
      '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }' +
      'body { font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif; color: #323130; background: #FFFFFF; -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
      '.page { max-width: 800px; margin: 0 auto; padding: 40px; }' +
      'table { border-collapse: collapse; }' +
      '@media print {' +
        'body { margin: 0; padding: 20mm; }' +
        '.page { padding: 0; max-width: none; }' +
        '.no-print { display: none !important; }' +
      '}' +
      '@media screen {' +
        '.no-print-toolbar { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 12px; background: #F3F2F1; border-bottom: 1px solid #EDEBE9; }' +
        '.no-print-toolbar button { padding: 8px 20px; border: none; border-radius: 4px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }' +
        '.btn-print { background: #0078D4; color: white; }' +
        '.btn-print:hover { background: #106EBE; }' +
        '.btn-close { background: #E1DFDD; color: #323130; }' +
        '.btn-close:hover { background: #D2D0CE; }' +
      '}' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<div class="no-print no-print-toolbar">' +
      '<button class="btn-print" onclick="window.print()">Print / Save as PDF</button>' +
      '<button class="btn-close" onclick="window.close()">Close</button>' +
    '</div>' +
    '<div class="page">' +

    // ===== HEADER SECTION =====
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid ' + typeConfig.color + ';">' +
      // Company info (left)
      '<div style="flex:1;">' +
        '<div style="font-size:24px;font-weight:700;color:#323130;margin-bottom:6px;">' + config.companyName + '</div>' +
        '<div style="font-size:11px;color:#605E5C;line-height:1.6;">' +
          addressHtml + '<br>' +
          config.companyPhone + '<br>' +
          config.companyEmail +
        '</div>' +
      '</div>' +
      // Document type (right)
      '<div style="text-align:right;">' +
        '<div style="font-size:28px;font-weight:700;color:' + typeConfig.color + ';letter-spacing:0.02em;">' + typeConfig.label + '</div>' +
        '<div style="font-size:14px;color:#605E5C;margin-top:4px;">' + (doc.number || '') + '</div>' +
      '</div>' +
    '</div>' +

    // ===== BILLING SECTION =====
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">' +
      // Bill To (left)
      '<div style="flex:1;">' +
        '<div style="font-size:11px;font-weight:600;color:#605E5C;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Bill To</div>' +
        '<div style="font-size:14px;color:#323130;font-weight:600;">' + (doc.contactName || 'N/A') + '</div>' +
        (doc.contactAddress ? '<div style="font-size:12px;color:#605E5C;margin-top:4px;line-height:1.5;">' + doc.contactAddress + '</div>' : '') +
      '</div>' +
      // Document details table (right)
      '<div>' +
        '<table style="min-width:260px;border:1px solid #E8E8E8;border-radius:4px;overflow:hidden;">' +
          '<tr style="background:#FAFAFA;">' +
            '<td style="padding:6px 12px;font-size:12px;color:#605E5C;font-weight:600;border-bottom:1px solid #F0F0F0;">Document No.</td>' +
            '<td style="padding:6px 12px;font-size:12px;color:#323130;border-bottom:1px solid #F0F0F0;">' + (doc.number || '-') + '</td>' +
          '</tr>' +
          '<tr>' +
            '<td style="padding:6px 12px;font-size:12px;color:#605E5C;font-weight:600;border-bottom:1px solid #F0F0F0;">Date</td>' +
            '<td style="padding:6px 12px;font-size:12px;color:#323130;border-bottom:1px solid #F0F0F0;">' + formatDate(doc.createdAt) + '</td>' +
          '</tr>' +
          validUntilRow +
          '<tr style="background:#FAFAFA;">' +
            '<td style="padding:6px 12px;font-size:12px;color:#605E5C;font-weight:600;">Status</td>' +
            '<td style="padding:6px 12px;font-size:12px;">' +
              '<span style="display:inline-block;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600;background:' + typeConfig.color + '20;color:' + typeConfig.color + ';">' + (doc.status || 'Draft') + '</span>' +
            '</td>' +
          '</tr>' +
        '</table>' +
      '</div>' +
    '</div>' +

    // ===== LINE ITEMS TABLE =====
    '<div style="margin-bottom:24px;">' +
      '<table style="width:100%;border:1px solid #E8E8E8;border-radius:4px;overflow:hidden;">' +
        '<thead>' +
          '<tr style="background:#F5F5F5;">' +
            '<th style="padding:10px 16px;text-align:center;font-size:12px;font-weight:600;color:#605E5C;border-bottom:2px solid #E0E0E0;width:50px;">#</th>' +
            '<th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#605E5C;border-bottom:2px solid #E0E0E0;">Description</th>' +
            '<th style="padding:10px 16px;text-align:right;font-size:12px;font-weight:600;color:#605E5C;border-bottom:2px solid #E0E0E0;width:80px;">Qty</th>' +
            '<th style="padding:10px 16px;text-align:right;font-size:12px;font-weight:600;color:#605E5C;border-bottom:2px solid #E0E0E0;width:120px;">Unit Price</th>' +
            '<th style="padding:10px 16px;text-align:right;font-size:12px;font-weight:600;color:#605E5C;border-bottom:2px solid #E0E0E0;width:100px;">Discount %</th>' +
            '<th style="padding:10px 16px;text-align:right;font-size:12px;font-weight:600;color:#605E5C;border-bottom:2px solid #E0E0E0;width:130px;">Amount</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          lineRows +
        '</tbody>' +
      '</table>' +
    '</div>' +

    // ===== TOTALS SECTION =====
    '<div style="display:flex;justify-content:flex-end;margin-bottom:32px;">' +
      '<table style="min-width:300px;">' +
        '<tr>' +
          '<td style="padding:6px 16px;font-size:13px;color:#605E5C;">Subtotal</td>' +
          '<td style="padding:6px 16px;font-size:13px;color:#323130;text-align:right;font-weight:600;">' + formatCurrency(doc.subtotal) + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="padding:6px 16px;font-size:13px;color:#605E5C;">Discount (' + (doc.discountPercent || 0) + '%)</td>' +
          '<td style="padding:6px 16px;font-size:13px;color:#323130;text-align:right;font-weight:600;">-' + formatCurrency((doc.subtotal || 0) * (doc.discountPercent || 0) / 100) + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="padding:6px 16px;font-size:13px;color:#605E5C;">Tax (' + (doc.taxPercent || 0) + '%)</td>' +
          '<td style="padding:6px 16px;font-size:13px;color:#323130;text-align:right;font-weight:600;">' + formatCurrency((doc.subtotal || 0) * (1 - (doc.discountPercent || 0) / 100) * (doc.taxPercent || 0) / 100) + '</td>' +
        '</tr>' +
        '<tr style="border-top:2px solid #323130;">' +
          '<td style="padding:10px 16px;font-size:16px;font-weight:700;color:#323130;">Total</td>' +
          '<td style="padding:10px 16px;font-size:16px;font-weight:700;color:' + typeConfig.color + ';text-align:right;background:' + typeConfig.color + '10;border-radius:0 4px 4px 0;">' + formatCurrency(doc.total) + '</td>' +
        '</tr>' +
      '</table>' +
    '</div>' +

    // ===== NOTES =====
    notesSection +

    // ===== FOOTER =====
    '<div style="margin-top:48px;padding-top:20px;border-top:1px solid #E8E8E8;text-align:center;">' +
      '<div style="font-size:14px;color:#605E5C;font-weight:600;margin-bottom:4px;">Thank you for your business!</div>' +
      '<div style="font-size:11px;color:#A19F9D;">' + config.companyName + '</div>' +
      '<div style="font-size:10px;color:#C8C6C4;margin-top:8px;">Generated on ' + generatedAt + '</div>' +
    '</div>' +

    '</div>' + // end .page
    '</body>' +
    '</html>'

  return html
}

/**
 * Generate a printable document and open it in a new browser window with print dialog.
 * @param {Object} document - The sales document object
 * @param {Object} [options] - Optional company/branding overrides
 */
export function generateDocumentPDF(document, options) {
  var defaults = {
    companyName: 'Virtuoso Technologies',
    companyAddress: '123 Business Park, Suite 400\nSan Francisco, CA 94105',
    companyPhone: '+1 (555) 123-4567',
    companyEmail: 'sales@virtuoso.com'
  }
  var config = Object.assign({}, defaults, options || {})

  var html = buildDocumentHTML(document, config)

  var printWindow = window.open('', '_blank', 'width=800,height=1100')
  if (!printWindow) {
    alert('Pop-up blocked. Please allow pop-ups for this site to print documents.')
    return
  }
  printWindow.document.write(html)
  printWindow.document.close()

  // Auto-trigger print dialog after a brief delay for rendering
  setTimeout(function () {
    printWindow.print()
  }, 500)
}

/**
 * Returns the document preview HTML string without opening a new window.
 * Useful for rendering an inline preview in a modal.
 * @param {Object} document - The sales document object
 * @param {Object} [options] - Optional company/branding overrides
 * @returns {string} HTML string for the document body content
 */
export function getDocumentPreviewHTML(document, options) {
  var defaults = {
    companyName: 'Virtuoso Technologies',
    companyAddress: '123 Business Park, Suite 400\nSan Francisco, CA 94105',
    companyPhone: '+1 (555) 123-4567',
    companyEmail: 'sales@virtuoso.com'
  }
  var config = Object.assign({}, defaults, options || {})

  var fullHTML = buildDocumentHTML(document, config)

  // Extract only the .page content (between the page div tags) for inline preview
  // We strip the <html>/<head>/<body> wrapper and the no-print toolbar
  var pageStart = fullHTML.indexOf('<div class="page">')
  var pageEnd = fullHTML.lastIndexOf('</div></body>')
  if (pageStart !== -1 && pageEnd !== -1) {
    return fullHTML.substring(pageStart, pageEnd + 6) // include closing </div>
  }

  // Fallback: return inner body content
  return fullHTML
}
