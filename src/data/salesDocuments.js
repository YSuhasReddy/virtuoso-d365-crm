/**
 * Demo sales documents data for Virtuoso D365 CRM
 * Types: Quote (SQ-), Order (SO-), Invoice (SI-), Credit Memo (SCM-)
 */
export default [
  // ─── QUOTES ─────────────────────────────────────────────────
  {
    id: 'SQ-10000',
    type: 'Quote',
    number: 'SQ-10000',
    contactId: 'CT-10015',
    contactName: 'Amanda Brooks',
    opportunityId: 'OPP-10000',
    status: 'Accepted',
    lines: [
      { id: 'SQ-10000-01', description: 'Software License - Enterprise Platform (50 seats)', quantity: 50, unitPrice: 2400, discount: 10, amount: 108000 },
      { id: 'SQ-10000-02', description: 'Annual Maintenance & Support', quantity: 1, unitPrice: 45000, discount: 0, amount: 45000 },
      { id: 'SQ-10000-03', description: 'Cloud Hosting - Premium Tier (Annual)', quantity: 1, unitPrice: 32000, discount: 0, amount: 32000 }
    ],
    subtotal: 185000,
    discountPercent: 0,
    taxPercent: 18,
    total: 218300,
    validUntil: '2025-08-30',
    notes: 'Enterprise renewal with expanded seat count. 10% volume discount on licenses applied.',
    createdAt: '2025-07-01T09:00:00Z',
    updatedAt: '2025-07-15T14:00:00Z'
  },
  {
    id: 'SQ-10001',
    type: 'Quote',
    number: 'SQ-10001',
    contactId: 'CT-10017',
    contactName: 'Lisa Martinez',
    opportunityId: 'OPP-10001',
    status: 'Sent',
    lines: [
      { id: 'SQ-10001-01', description: 'Consulting Services - ERP Integration', quantity: 200, unitPrice: 250, discount: 0, amount: 50000 },
      { id: 'SQ-10001-02', description: 'Custom Development - Manufacturing Modules', quantity: 1, unitPrice: 55000, discount: 0, amount: 55000 },
      { id: 'SQ-10001-03', description: 'Data Migration - Legacy ERP to New Platform', quantity: 1, unitPrice: 22000, discount: 5, amount: 20900 },
      { id: 'SQ-10001-04', description: 'Training Program - Operations Team (20 users)', quantity: 20, unitPrice: 800, discount: 0, amount: 16000 }
    ],
    subtotal: 141900,
    discountPercent: 0,
    taxPercent: 18,
    total: 167442,
    validUntil: '2026-02-28',
    notes: 'Comprehensive ERP integration package. Data migration includes 3 legacy systems.',
    createdAt: '2025-11-15T10:00:00Z',
    updatedAt: '2025-12-01T11:30:00Z'
  },
  {
    id: 'SQ-10002',
    type: 'Quote',
    number: 'SQ-10002',
    contactId: 'CT-10020',
    contactName: 'Thomas Wright',
    opportunityId: 'OPP-10003',
    status: 'Sent',
    lines: [
      { id: 'SQ-10002-01', description: 'Software License - POS Module (25 locations)', quantity: 25, unitPrice: 3200, discount: 15, amount: 68000 },
      { id: 'SQ-10002-02', description: 'Implementation Fee - Per Location', quantity: 25, unitPrice: 1200, discount: 0, amount: 30000 },
      { id: 'SQ-10002-03', description: 'Hardware Setup - POS Terminals', quantity: 25, unitPrice: 850, discount: 0, amount: 21250 }
    ],
    subtotal: 119250,
    discountPercent: 0,
    taxPercent: 18,
    total: 140715,
    validUntil: '2026-03-15',
    notes: 'Volume discount of 15% on POS licenses for 25+ locations. Includes on-site setup.',
    createdAt: '2025-10-15T09:00:00Z',
    updatedAt: '2025-10-20T16:00:00Z'
  },
  {
    id: 'SQ-10003',
    type: 'Quote',
    number: 'SQ-10003',
    contactId: 'CT-10029',
    contactName: 'Jessica Lee',
    opportunityId: 'OPP-10011',
    status: 'Sent',
    lines: [
      { id: 'SQ-10003-01', description: 'Software License - Enrollment Management', quantity: 1, unitPrice: 28000, discount: 0, amount: 28000 },
      { id: 'SQ-10003-02', description: 'Custom Development - Student Portal', quantity: 1, unitPrice: 15000, discount: 0, amount: 15000 },
      { id: 'SQ-10003-03', description: 'Training Program - Admin Staff (10 users)', quantity: 10, unitPrice: 600, discount: 0, amount: 6000 },
      { id: 'SQ-10003-04', description: 'Support Contract - 12 Months', quantity: 1, unitPrice: 6000, discount: 0, amount: 6000 }
    ],
    subtotal: 55000,
    discountPercent: 0,
    taxPercent: 18,
    total: 64900,
    validUntil: '2026-01-31',
    notes: 'Student enrollment management for academic year 2026-2027. Go-live targeted for June.',
    createdAt: '2025-10-25T11:00:00Z',
    updatedAt: '2025-11-05T14:00:00Z'
  },
  {
    id: 'SQ-10004',
    type: 'Quote',
    number: 'SQ-10004',
    contactId: 'CT-10018',
    contactName: 'James Turner',
    opportunityId: 'OPP-10014',
    status: 'Rejected',
    lines: [
      { id: 'SQ-10004-01', description: 'Software License - Quality Control Module', quantity: 1, unitPrice: 42000, discount: 0, amount: 42000 },
      { id: 'SQ-10004-02', description: 'Consulting Services - QC Process Mapping', quantity: 80, unitPrice: 250, discount: 0, amount: 20000 },
      { id: 'SQ-10004-03', description: 'Implementation Fee', quantity: 1, unitPrice: 26000, discount: 0, amount: 26000 }
    ],
    subtotal: 88000,
    discountPercent: 0,
    taxPercent: 18,
    total: 103840,
    validUntil: '2025-09-30',
    notes: 'Quote rejected - customer chose competitor with existing manufacturing integration.',
    createdAt: '2025-07-10T10:00:00Z',
    updatedAt: '2025-10-15T09:00:00Z'
  },
  {
    id: 'SQ-10005',
    type: 'Quote',
    number: 'SQ-10005',
    contactId: 'CT-10030',
    contactName: 'William Carter',
    opportunityId: 'OPP-10012',
    status: 'Draft',
    lines: [
      { id: 'SQ-10005-01', description: 'Consulting Services - Supply Chain Assessment', quantity: 120, unitPrice: 275, discount: 0, amount: 33000 },
      { id: 'SQ-10005-02', description: 'Software License - Supply Chain Platform', quantity: 1, unitPrice: 85000, discount: 5, amount: 80750 },
      { id: 'SQ-10005-03', description: 'Data Migration - Logistics Systems', quantity: 1, unitPrice: 28000, discount: 0, amount: 28000 },
      { id: 'SQ-10005-04', description: 'Training Program - Supply Chain Team (15 users)', quantity: 15, unitPrice: 800, discount: 0, amount: 12000 }
    ],
    subtotal: 153750,
    discountPercent: 0,
    taxPercent: 18,
    total: 181425,
    validUntil: '2026-04-30',
    notes: 'Draft - pending internal review before sending to Wide World Importers.',
    createdAt: '2025-12-12T10:00:00Z',
    updatedAt: '2025-12-14T11:00:00Z'
  },

  // ─── ORDERS ─────────────────────────────────────────────────
  {
    id: 'SO-10000',
    type: 'Order',
    number: 'SO-10000',
    contactId: 'CT-10015',
    contactName: 'Amanda Brooks',
    opportunityId: 'OPP-10000',
    status: 'Delivered',
    lines: [
      { id: 'SO-10000-01', description: 'Software License - Enterprise Platform (50 seats)', quantity: 50, unitPrice: 2400, discount: 10, amount: 108000 },
      { id: 'SO-10000-02', description: 'Annual Maintenance & Support', quantity: 1, unitPrice: 45000, discount: 0, amount: 45000 },
      { id: 'SO-10000-03', description: 'Cloud Hosting - Premium Tier (Annual)', quantity: 1, unitPrice: 32000, discount: 0, amount: 32000 }
    ],
    subtotal: 185000,
    discountPercent: 0,
    taxPercent: 18,
    total: 218300,
    validUntil: null,
    notes: 'Order confirmed following accepted quote SQ-10000. All licenses provisioned.',
    createdAt: '2025-08-01T09:00:00Z',
    updatedAt: '2025-09-28T14:00:00Z'
  },
  {
    id: 'SO-10001',
    type: 'Order',
    number: 'SO-10001',
    contactId: 'CT-10021',
    contactName: 'Patricia Nguyen',
    opportunityId: 'OPP-10004',
    status: 'Delivered',
    lines: [
      { id: 'SO-10001-01', description: 'Software License - HIPAA Compliance Module', quantity: 1, unitPrice: 38000, discount: 0, amount: 38000 },
      { id: 'SO-10001-02', description: 'Implementation Fee - Healthcare Configuration', quantity: 1, unitPrice: 22000, discount: 0, amount: 22000 },
      { id: 'SO-10001-03', description: 'Support Contract - HIPAA Priority (12 Months)', quantity: 1, unitPrice: 18000, discount: 0, amount: 18000 }
    ],
    subtotal: 78000,
    discountPercent: 0,
    taxPercent: 18,
    total: 92040,
    validUntil: null,
    notes: 'HIPAA compliance module deployed and validated. Priority support active.',
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-11-12T10:30:00Z'
  },
  {
    id: 'SO-10002',
    type: 'Order',
    number: 'SO-10002',
    contactId: 'CT-10025',
    contactName: 'Michelle Torres',
    opportunityId: 'OPP-10008',
    status: 'Shipped',
    lines: [
      { id: 'SO-10002-01', description: 'Software License - E-commerce Analytics', quantity: 1, unitPrice: 52000, discount: 0, amount: 52000 },
      { id: 'SO-10002-02', description: 'Custom Development - Real-time Inventory Dashboard', quantity: 1, unitPrice: 25000, discount: 0, amount: 25000 },
      { id: 'SO-10002-03', description: 'Training Program - Digital Team (8 users)', quantity: 8, unitPrice: 750, discount: 0, amount: 6000 },
      { id: 'SO-10002-04', description: 'Support Contract - Standard (12 Months)', quantity: 1, unitPrice: 9000, discount: 0, amount: 9000 }
    ],
    subtotal: 92000,
    discountPercent: 0,
    taxPercent: 18,
    total: 108560,
    validUntil: null,
    notes: 'E-commerce analytics suite in final deployment phase. Training scheduled for next week.',
    createdAt: '2025-09-15T08:00:00Z',
    updatedAt: '2025-10-29T16:00:00Z'
  },
  {
    id: 'SO-10003',
    type: 'Order',
    number: 'SO-10003',
    contactId: 'CT-10028',
    contactName: 'Marcus Reed',
    opportunityId: 'OPP-10010',
    status: 'Delivered',
    lines: [
      { id: 'SO-10003-01', description: 'Software License - Distribution Tracking', quantity: 1, unitPrice: 18000, discount: 0, amount: 18000 },
      { id: 'SO-10003-02', description: 'Implementation Fee', quantity: 1, unitPrice: 10000, discount: 0, amount: 10000 },
      { id: 'SO-10003-03', description: 'Support Contract - Standard (12 Months)', quantity: 1, unitPrice: 6000, discount: 0, amount: 6000 }
    ],
    subtotal: 34000,
    discountPercent: 0,
    taxPercent: 18,
    total: 40120,
    validUntil: null,
    notes: 'Distribution tracking live and operational. Customer satisfied with deployment.',
    createdAt: '2025-07-01T11:00:00Z',
    updatedAt: '2025-08-13T14:00:00Z'
  },
  {
    id: 'SO-10004',
    type: 'Order',
    number: 'SO-10004',
    contactId: 'CT-10022',
    contactName: 'Kevin O\'Brien',
    opportunityId: 'OPP-10020',
    status: 'Processing',
    lines: [
      { id: 'SO-10004-01', description: 'Software License - ML Toolkit Platform', quantity: 1, unitPrice: 85000, discount: 0, amount: 85000 },
      { id: 'SO-10004-02', description: 'Custom Development - AI Model Integration', quantity: 1, unitPrice: 45000, discount: 0, amount: 45000 },
      { id: 'SO-10004-03', description: 'Consulting Services - ML Architecture', quantity: 60, unitPrice: 300, discount: 0, amount: 18000 },
      { id: 'SO-10004-04', description: 'Cloud Hosting - GPU Compute (6 Months)', quantity: 6, unitPrice: 1333, discount: 0, amount: 7998 }
    ],
    subtotal: 155998,
    discountPercent: 0,
    taxPercent: 18,
    total: 184077.64,
    validUntil: null,
    notes: 'Phase 1 of ML toolkit joint venture. GPU compute provisioning in progress.',
    createdAt: '2025-11-01T09:00:00Z',
    updatedAt: '2025-12-14T16:00:00Z'
  },

  // ─── INVOICES ───────────────────────────────────────────────
  {
    id: 'SI-10000',
    type: 'Invoice',
    number: 'SI-10000',
    contactId: 'CT-10015',
    contactName: 'Amanda Brooks',
    opportunityId: 'OPP-10000',
    status: 'Paid',
    lines: [
      { id: 'SI-10000-01', description: 'Software License - Enterprise Platform (50 seats)', quantity: 50, unitPrice: 2400, discount: 10, amount: 108000 },
      { id: 'SI-10000-02', description: 'Annual Maintenance & Support', quantity: 1, unitPrice: 45000, discount: 0, amount: 45000 },
      { id: 'SI-10000-03', description: 'Cloud Hosting - Premium Tier (Annual)', quantity: 1, unitPrice: 32000, discount: 0, amount: 32000 }
    ],
    subtotal: 185000,
    discountPercent: 0,
    taxPercent: 18,
    total: 218300,
    validUntil: null,
    notes: 'Payment received via wire transfer on 2025-10-05. Reference: ADT-2025-ENT-001.',
    createdAt: '2025-09-28T14:00:00Z',
    updatedAt: '2025-10-05T09:00:00Z'
  },
  {
    id: 'SI-10001',
    type: 'Invoice',
    number: 'SI-10001',
    contactId: 'CT-10021',
    contactName: 'Patricia Nguyen',
    opportunityId: 'OPP-10004',
    status: 'Paid',
    lines: [
      { id: 'SI-10001-01', description: 'Software License - HIPAA Compliance Module', quantity: 1, unitPrice: 38000, discount: 0, amount: 38000 },
      { id: 'SI-10001-02', description: 'Implementation Fee - Healthcare Configuration', quantity: 1, unitPrice: 22000, discount: 0, amount: 22000 },
      { id: 'SI-10001-03', description: 'Support Contract - HIPAA Priority (12 Months)', quantity: 1, unitPrice: 18000, discount: 0, amount: 18000 }
    ],
    subtotal: 78000,
    discountPercent: 0,
    taxPercent: 18,
    total: 92040,
    validUntil: null,
    notes: 'Payment received via ACH on 2025-12-01. Net 30 terms honored.',
    createdAt: '2025-11-12T10:30:00Z',
    updatedAt: '2025-12-01T08:00:00Z'
  },
  {
    id: 'SI-10002',
    type: 'Invoice',
    number: 'SI-10002',
    contactId: 'CT-10028',
    contactName: 'Marcus Reed',
    opportunityId: 'OPP-10010',
    status: 'Paid',
    lines: [
      { id: 'SI-10002-01', description: 'Software License - Distribution Tracking', quantity: 1, unitPrice: 18000, discount: 0, amount: 18000 },
      { id: 'SI-10002-02', description: 'Implementation Fee', quantity: 1, unitPrice: 10000, discount: 0, amount: 10000 },
      { id: 'SI-10002-03', description: 'Support Contract - Standard (12 Months)', quantity: 1, unitPrice: 6000, discount: 0, amount: 6000 }
    ],
    subtotal: 34000,
    discountPercent: 0,
    taxPercent: 18,
    total: 40120,
    validUntil: null,
    notes: 'Payment received via check on 2025-09-10.',
    createdAt: '2025-08-13T14:00:00Z',
    updatedAt: '2025-09-10T10:00:00Z'
  },
  {
    id: 'SI-10003',
    type: 'Invoice',
    number: 'SI-10003',
    contactId: 'CT-10025',
    contactName: 'Michelle Torres',
    opportunityId: 'OPP-10008',
    status: 'Unpaid',
    lines: [
      { id: 'SI-10003-01', description: 'Software License - E-commerce Analytics', quantity: 1, unitPrice: 52000, discount: 0, amount: 52000 },
      { id: 'SI-10003-02', description: 'Custom Development - Real-time Inventory Dashboard', quantity: 1, unitPrice: 25000, discount: 0, amount: 25000 },
      { id: 'SI-10003-03', description: 'Training Program - Digital Team (8 users)', quantity: 8, unitPrice: 750, discount: 0, amount: 6000 },
      { id: 'SI-10003-04', description: 'Support Contract - Standard (12 Months)', quantity: 1, unitPrice: 9000, discount: 0, amount: 9000 }
    ],
    subtotal: 92000,
    discountPercent: 0,
    taxPercent: 18,
    total: 108560,
    validUntil: null,
    notes: 'Invoice sent on 2025-11-15. Payment due by 2025-12-15. Net 30 terms.',
    createdAt: '2025-11-15T09:00:00Z',
    updatedAt: '2025-11-15T09:00:00Z'
  },
  {
    id: 'SI-10004',
    type: 'Invoice',
    number: 'SI-10004',
    contactId: 'CT-10022',
    contactName: 'Kevin O\'Brien',
    opportunityId: 'OPP-10020',
    status: 'Overdue',
    lines: [
      { id: 'SI-10004-01', description: 'Consulting Services - ML Architecture (Phase 1)', quantity: 60, unitPrice: 300, discount: 0, amount: 18000 },
      { id: 'SI-10004-02', description: 'Cloud Hosting - GPU Compute (3 Months Advance)', quantity: 3, unitPrice: 1333, discount: 0, amount: 3999 }
    ],
    subtotal: 21999,
    discountPercent: 0,
    taxPercent: 18,
    total: 25958.82,
    validUntil: null,
    notes: 'Partial invoice for Phase 1 consulting and hosting. Payment was due 2025-12-01. Follow up needed.',
    createdAt: '2025-11-01T09:00:00Z',
    updatedAt: '2025-12-14T10:00:00Z'
  },

  // ─── CREDIT MEMOS ──────────────────────────────────────────
  {
    id: 'SCM-10000',
    type: 'Credit Memo',
    number: 'SCM-10000',
    contactId: 'CT-10015',
    contactName: 'Amanda Brooks',
    opportunityId: 'OPP-10000',
    status: 'Applied',
    lines: [
      { id: 'SCM-10000-01', description: 'Credit - Duplicate Maintenance Charge (Q3)', quantity: 1, unitPrice: 11250, discount: 0, amount: 11250 }
    ],
    subtotal: 11250,
    discountPercent: 0,
    taxPercent: 18,
    total: 13275,
    validUntil: null,
    notes: 'Credit memo issued for duplicate quarterly maintenance charge. Applied to next invoice cycle.',
    createdAt: '2025-10-15T11:00:00Z',
    updatedAt: '2025-10-20T09:00:00Z'
  },
  {
    id: 'SCM-10001',
    type: 'Credit Memo',
    number: 'SCM-10001',
    contactId: 'CT-10028',
    contactName: 'Marcus Reed',
    opportunityId: 'OPP-10010',
    status: 'Applied',
    lines: [
      { id: 'SCM-10001-01', description: 'Credit - Implementation Scope Reduction', quantity: 1, unitPrice: 3000, discount: 0, amount: 3000 }
    ],
    subtotal: 3000,
    discountPercent: 0,
    taxPercent: 18,
    total: 3540,
    validUntil: null,
    notes: 'Partial credit for reduced implementation scope. Two integration points removed from original plan.',
    createdAt: '2025-08-25T14:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z'
  }
]
