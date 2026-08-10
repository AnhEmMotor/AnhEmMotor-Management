import type { GuideSection } from './guideData';
import {
  Goods,
  Avatar,
  DocumentAdd,
  List,
  Money,
  DataLine,
  Notebook,
  Document,
  Setting,
} from '@element-plus/icons-vue';

import { sectionData as productData } from '../sections/productData';
import { sectionData as supplierData } from '../sections/supplierData';
import { sectionData as purchaseRequestData } from '../sections/purchaseRequestData';
import { sectionData as inputData } from '../sections/inputData';
import { sectionData as debtData } from '../sections/debtData';
import { sectionData as inOutStockData } from '../sections/inOutStockData';
import { sectionData as ledgerData } from '../sections/ledgerData';
import { sectionData as contractData } from '../sections/contractData';
import { sectionData as inventorySettingsData } from '../sections/inventorySettingsData';

export const guideSections: GuideSection[] = [
  {
    ...productData,
    id: 'product',
    icon: Goods,
    subtitle: 'Product Management',
    color: '#3b82f6',
    shadowColor: 'rgba(59,130,246,0.15)',
    imageUrl: '/images/manual/dashboard_overview_1785990505505.png',
  },
  {
    ...supplierData,
    id: 'supplier',
    icon: Avatar,
    subtitle: 'Suppliers',
    color: '#f59e0b',
    shadowColor: 'rgba(245,158,11,0.15)',
    imageUrl: '/images/manual/contract_management_1785990526494.png',
  },
  {
    ...purchaseRequestData,
    id: 'purchase-request',
    icon: DocumentAdd,
    subtitle: 'Purchase Requests',
    color: '#8b5cf6',
    shadowColor: 'rgba(139,92,246,0.15)',
    imageUrl: '/images/manual/sales_invoice_1785990516203.png',
  },
  {
    ...inputData,
    id: 'input',
    icon: List,
    subtitle: 'Input Management',
    color: '#10b981',
    shadowColor: 'rgba(16,185,129,0.15)',
    imageUrl: '/images/manual/workshop_kanban_1785990569362.png',
  },
  {
    ...debtData,
    id: 'debt',
    icon: Money,
    subtitle: 'Debt Management',
    color: '#ef4444',
    shadowColor: 'rgba(239,68,68,0.15)',
    imageUrl: '/images/manual/sales_invoice_1785990516203.png',
  },
  {
    ...inOutStockData,
    id: 'in-out-stock',
    icon: DataLine,
    subtitle: 'In-Out Stock',
    color: '#0ea5e9',
    shadowColor: 'rgba(14,165,233,0.15)',
    imageUrl: '/images/manual/reporting_charts_1785990538004.png',
  },
  {
    ...ledgerData,
    id: 'ledger',
    icon: Notebook,
    subtitle: 'Inventory Ledger',
    color: '#14b8a6',
    shadowColor: 'rgba(20,184,166,0.15)',
    imageUrl: '/images/manual/acc_inventory_1785991230022.png',
  },
  {
    ...contractData,
    id: 'contract',
    icon: Document,
    subtitle: 'Contracts',
    color: '#6366f1',
    shadowColor: 'rgba(99,102,241,0.15)',
    imageUrl: '/images/manual/contract_management_1785990526494.png',
  },
  {
    ...inventorySettingsData,
    id: 'inventory-settings',
    icon: Setting,
    subtitle: 'Inventory Settings',
    color: '#64748b',
    shadowColor: 'rgba(100,116,139,0.15)',
    imageUrl: '/images/manual/acc_dashboard_1785991209802.png',
  },
] as GuideSection[];
