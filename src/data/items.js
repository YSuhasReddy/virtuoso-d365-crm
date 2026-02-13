/**
 * Demo items/products data for Virtuoso D365 CRM
 * Items: ITM-10000 through ITM-10017
 */
export default [
  // ─── SOFTWARE LICENSES ────────────────────────────────────
  {
    id: 'ITM-10000',
    number: 'ITM-10000',
    name: 'Enterprise Platform License',
    description: 'Annual enterprise platform license with unlimited users. Includes core CRM, ERP, and analytics modules.',
    type: 'Service',
    category: 'Software',
    unitPrice: 24999.00,
    unitCost: 5000.00,
    unitOfMeasure: 'License',
    inventory: { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
    taxGroup: 'Standard',
    blocked: false,
    attributes: [
      { name: 'License Type', value: 'Annual' },
      { name: 'Users', value: 'Unlimited' }
    ],
    vendor: 'Virtuoso Technologies',
    createdAt: '2021-01-15T09:00:00Z',
    updatedAt: '2025-11-20T14:30:00Z'
  },
  {
    id: 'ITM-10001',
    number: 'ITM-10001',
    name: 'Professional User License',
    description: 'Per-user annual license for the professional tier. Includes CRM and basic reporting.',
    type: 'Service',
    category: 'Software',
    unitPrice: 1499.00,
    unitCost: 300.00,
    unitOfMeasure: 'License',
    inventory: { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
    taxGroup: 'Standard',
    blocked: false,
    attributes: [
      { name: 'License Type', value: 'Annual' },
      { name: 'Tier', value: 'Professional' }
    ],
    vendor: 'Virtuoso Technologies',
    createdAt: '2021-02-10T10:00:00Z',
    updatedAt: '2025-10-05T11:45:00Z'
  },
  {
    id: 'ITM-10002',
    number: 'ITM-10002',
    name: 'Analytics Add-On Module',
    description: 'Advanced analytics and business intelligence add-on module with custom dashboards and predictive insights.',
    type: 'Service',
    category: 'Software',
    unitPrice: 4999.00,
    unitCost: 1200.00,
    unitOfMeasure: 'License',
    inventory: { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
    taxGroup: 'Standard',
    blocked: false,
    attributes: [
      { name: 'Module', value: 'Analytics' },
      { name: 'License Type', value: 'Annual' }
    ],
    vendor: 'Virtuoso Technologies',
    createdAt: '2022-03-20T08:30:00Z',
    updatedAt: '2025-12-01T16:20:00Z'
  },
  {
    id: 'ITM-10003',
    number: 'ITM-10003',
    name: 'API Integration Gateway',
    description: 'RESTful API gateway license for third-party integrations. Supports up to 500,000 monthly API calls.',
    type: 'Service',
    category: 'Software',
    unitPrice: 2999.00,
    unitCost: 600.00,
    unitOfMeasure: 'License',
    inventory: { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
    taxGroup: 'Standard',
    blocked: false,
    attributes: [
      { name: 'API Calls', value: '500K/month' },
      { name: 'Protocol', value: 'REST' }
    ],
    vendor: 'Virtuoso Technologies',
    createdAt: '2022-06-15T13:00:00Z',
    updatedAt: '2025-09-15T10:00:00Z'
  },

  // ─── HARDWARE ─────────────────────────────────────────────
  {
    id: 'ITM-10004',
    number: 'ITM-10004',
    name: 'Barcode Scanner - Wireless',
    description: 'Industrial-grade wireless barcode scanner with Bluetooth 5.0 connectivity. Compatible with all major POS systems.',
    type: 'Inventory',
    category: 'Hardware',
    unitPrice: 349.99,
    unitCost: 175.00,
    unitOfMeasure: 'Each',
    inventory: { quantity: 45, reorderPoint: 10, reorderQuantity: 50 },
    taxGroup: 'Standard',
    blocked: false,
    attributes: [
      { name: 'Connectivity', value: 'Bluetooth 5.0' },
      { name: 'Color', value: 'Black' }
    ],
    vendor: 'TechScan Solutions',
    createdAt: '2023-01-18T11:30:00Z',
    updatedAt: '2025-11-10T09:15:00Z'
  },
  {
    id: 'ITM-10005',
    number: 'ITM-10005',
    name: 'Receipt Printer - Thermal',
    description: '80mm thermal receipt printer with USB and Ethernet interface. Auto-cutter included.',
    type: 'Inventory',
    category: 'Hardware',
    unitPrice: 289.99,
    unitCost: 145.00,
    unitOfMeasure: 'Each',
    inventory: { quantity: 22, reorderPoint: 8, reorderQuantity: 30 },
    taxGroup: 'Standard',
    blocked: false,
    attributes: [
      { name: 'Print Width', value: '80mm' },
      { name: 'Interface', value: 'USB/Ethernet' }
    ],
    vendor: 'TechScan Solutions',
    createdAt: '2023-04-12T15:30:00Z',
    updatedAt: '2025-10-18T09:45:00Z'
  },
  {
    id: 'ITM-10006',
    number: 'ITM-10006',
    name: 'POS Terminal - Touchscreen',
    description: '15-inch capacitive touchscreen POS terminal with integrated card reader and customer display.',
    type: 'Inventory',
    category: 'Hardware',
    unitPrice: 1299.99,
    unitCost: 680.00,
    unitOfMeasure: 'Each',
    inventory: { quantity: 8, reorderPoint: 5, reorderQuantity: 15 },
    taxGroup: 'Standard',
    blocked: false,
    attributes: [
      { name: 'Screen Size', value: '15 inch' },
      { name: 'Touch Type', value: 'Capacitive' }
    ],
    vendor: 'RetailTech Corp',
    createdAt: '2023-07-20T14:00:00Z',
    updatedAt: '2025-10-28T12:30:00Z'
  },
  {
    id: 'ITM-10007',
    number: 'ITM-10007',
    name: 'Label Printer - Industrial',
    description: 'Industrial-grade label printer for warehouse and shipping operations. Supports 4-inch wide labels.',
    type: 'Inventory',
    category: 'Hardware',
    unitPrice: 599.99,
    unitCost: 310.00,
    unitOfMeasure: 'Each',
    inventory: { quantity: 3, reorderPoint: 5, reorderQuantity: 10 },
    taxGroup: 'Standard',
    blocked: false,
    attributes: [
      { name: 'Label Width', value: '4 inch' },
      { name: 'Resolution', value: '300 DPI' }
    ],
    vendor: 'RetailTech Corp',
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2025-12-10T15:45:00Z'
  },

  // ─── SERVICES ─────────────────────────────────────────────
  {
    id: 'ITM-10008',
    number: 'ITM-10008',
    name: 'Implementation Consulting',
    description: 'On-site or remote implementation consulting services. Includes system setup, data migration, and go-live support.',
    type: 'Service',
    category: 'Services',
    unitPrice: 250.00,
    unitCost: 125.00,
    unitOfMeasure: 'Hour',
    inventory: { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
    taxGroup: 'Standard',
    blocked: false,
    attributes: [
      { name: 'Delivery', value: 'On-site/Remote' },
      { name: 'Min Hours', value: '40' }
    ],
    vendor: 'Virtuoso Technologies',
    createdAt: '2021-05-09T11:30:00Z',
    updatedAt: '2025-11-25T13:00:00Z'
  },
  {
    id: 'ITM-10009',
    number: 'ITM-10009',
    name: 'Custom Development',
    description: 'Bespoke software development services for customizations, integrations, and extensions.',
    type: 'Service',
    category: 'Services',
    unitPrice: 275.00,
    unitCost: 140.00,
    unitOfMeasure: 'Hour',
    inventory: { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
    taxGroup: 'Standard',
    blocked: false,
    attributes: [
      { name: 'Scope', value: 'Custom' },
      { name: 'Methodology', value: 'Agile' }
    ],
    vendor: 'Virtuoso Technologies',
    createdAt: '2022-02-14T09:45:00Z',
    updatedAt: '2025-12-05T08:00:00Z'
  },
  {
    id: 'ITM-10010',
    number: 'ITM-10010',
    name: 'Data Migration Service',
    description: 'Full data migration service from legacy systems. Includes data mapping, cleansing, and validation.',
    type: 'Service',
    category: 'Services',
    unitPrice: 8500.00,
    unitCost: 4000.00,
    unitOfMeasure: 'Each',
    inventory: { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
    taxGroup: 'Standard',
    blocked: false,
    attributes: [
      { name: 'Delivery', value: 'Remote' },
      { name: 'Duration', value: '2-4 weeks' }
    ],
    vendor: 'Virtuoso Technologies',
    createdAt: '2023-09-01T12:00:00Z',
    updatedAt: '2025-11-05T14:20:00Z'
  },

  // ─── TRAINING ─────────────────────────────────────────────
  {
    id: 'ITM-10011',
    number: 'ITM-10011',
    name: 'End-User Training - Basic',
    description: 'Instructor-led basic training for end users. Covers navigation, data entry, and standard workflows.',
    type: 'Service',
    category: 'Training',
    unitPrice: 500.00,
    unitCost: 200.00,
    unitOfMeasure: 'Each',
    inventory: { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
    taxGroup: 'Zero',
    blocked: false,
    attributes: [
      { name: 'Level', value: 'Basic' },
      { name: 'Duration', value: '1 day' },
      { name: 'Format', value: 'Instructor-led' }
    ],
    vendor: 'Virtuoso Technologies',
    createdAt: '2022-08-30T11:00:00Z',
    updatedAt: '2025-12-08T10:30:00Z'
  },
  {
    id: 'ITM-10012',
    number: 'ITM-10012',
    name: 'Administrator Training - Advanced',
    description: 'Advanced administrator training covering system configuration, security, workflows, and customization.',
    type: 'Service',
    category: 'Training',
    unitPrice: 1200.00,
    unitCost: 500.00,
    unitOfMeasure: 'Each',
    inventory: { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
    taxGroup: 'Zero',
    blocked: false,
    attributes: [
      { name: 'Level', value: 'Advanced' },
      { name: 'Duration', value: '3 days' },
      { name: 'Format', value: 'Instructor-led' }
    ],
    vendor: 'Virtuoso Technologies',
    createdAt: '2023-02-28T13:30:00Z',
    updatedAt: '2025-11-30T10:15:00Z'
  },
  {
    id: 'ITM-10013',
    number: 'ITM-10013',
    name: 'Online Training Course Pack',
    description: 'Self-paced online training course bundle. Includes 20+ hours of video content and hands-on labs.',
    type: 'Service',
    category: 'Training',
    unitPrice: 299.00,
    unitCost: 50.00,
    unitOfMeasure: 'Pack',
    inventory: { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
    taxGroup: 'Zero',
    blocked: false,
    attributes: [
      { name: 'Format', value: 'Self-paced' },
      { name: 'Content Hours', value: '20+' }
    ],
    vendor: 'Virtuoso Technologies',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2025-09-30T16:00:00Z'
  },

  // ─── SUPPORT ──────────────────────────────────────────────
  {
    id: 'ITM-10014',
    number: 'ITM-10014',
    name: 'Standard Support Plan',
    description: 'Annual standard support plan. Business hours support (8x5) with 8-hour response time SLA.',
    type: 'Service',
    category: 'Support',
    unitPrice: 3999.00,
    unitCost: 1200.00,
    unitOfMeasure: 'License',
    inventory: { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
    taxGroup: 'Standard',
    blocked: false,
    attributes: [
      { name: 'Coverage', value: '8x5' },
      { name: 'Response SLA', value: '8 hours' }
    ],
    vendor: 'Virtuoso Technologies',
    createdAt: '2021-11-03T08:00:00Z',
    updatedAt: '2025-11-20T14:30:00Z'
  },
  {
    id: 'ITM-10015',
    number: 'ITM-10015',
    name: 'Premium Support Plan',
    description: 'Annual premium support plan. 24/7 support with 2-hour response time SLA and dedicated account manager.',
    type: 'Service',
    category: 'Support',
    unitPrice: 9999.00,
    unitCost: 3500.00,
    unitOfMeasure: 'License',
    inventory: { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
    taxGroup: 'Standard',
    blocked: false,
    attributes: [
      { name: 'Coverage', value: '24/7' },
      { name: 'Response SLA', value: '2 hours' },
      { name: 'Dedicated Manager', value: 'Yes' }
    ],
    vendor: 'Virtuoso Technologies',
    createdAt: '2021-11-03T08:30:00Z',
    updatedAt: '2025-12-12T11:00:00Z'
  },

  // ─── NON-INVENTORY ────────────────────────────────────────
  {
    id: 'ITM-10016',
    number: 'ITM-10016',
    name: 'Shipping & Handling',
    description: 'Standard shipping and handling charge for hardware deliveries within the continental US.',
    type: 'Non-Inventory',
    category: 'Services',
    unitPrice: 49.99,
    unitCost: 25.00,
    unitOfMeasure: 'Each',
    inventory: { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
    taxGroup: 'Zero',
    blocked: false,
    attributes: [
      { name: 'Region', value: 'Continental US' }
    ],
    vendor: 'FastFreight Logistics',
    createdAt: '2023-06-10T09:00:00Z',
    updatedAt: '2025-08-20T15:00:00Z'
  },
  {
    id: 'ITM-10017',
    number: 'ITM-10017',
    name: 'Extended Warranty - Hardware',
    description: 'Extended 2-year warranty for all hardware products. Covers parts and labor for manufacturing defects.',
    type: 'Non-Inventory',
    category: 'Support',
    unitPrice: 199.99,
    unitCost: 60.00,
    unitOfMeasure: 'Each',
    inventory: { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
    taxGroup: 'Reduced',
    blocked: false,
    attributes: [
      { name: 'Duration', value: '2 years' },
      { name: 'Coverage', value: 'Parts & Labor' }
    ],
    vendor: 'RetailTech Corp',
    createdAt: '2024-03-01T11:30:00Z',
    updatedAt: '2025-10-02T10:30:00Z'
  }
]
