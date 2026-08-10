import type { GuideSection } from './guideData';
import {
  DocumentAdd,
  DocumentChecked,
  Setting,
  Tickets,
  RefreshLeft,
  Document,
  Goods,
  Van,
  DataAnalysis,
} from '@element-plus/icons-vue';

import { sectionData as draftData } from '../sections/draftData';
import { sectionData as orderData } from '../sections/orderData';
import { sectionData as depositSettingsData } from '../sections/depositSettingsData';
import { sectionData as invoiceData } from '../sections/invoiceData';
import { sectionData as returnsData } from '../sections/returnsData';
import { sectionData as contractData } from '../sections/contractData';
import { sectionData as productData } from '../sections/productData';
import { sectionData as logisticsData } from '../sections/logisticsData';
import { sectionData as statisticsData } from '../sections/statisticsData';

export const guideSections: GuideSection[] = [
  {
    ...draftData,
    id: 'draft',
    icon: DocumentAdd,
    subtitle: 'Draft Orders',
    color: '#94a3b8',
    shadowColor: 'rgba(148,163,184,0.15)',
    imageUrl: '/images/manual/dashboard_overview_1785990505505.png',
  },
  {
    ...orderData,
    id: 'order',
    icon: DocumentChecked,
    subtitle: 'Sales Orders',
    color: '#0ea5e9',
    shadowColor: 'rgba(14,165,233,0.15)',
    imageUrl: '/images/manual/contract_management_1785990526494.png',
  },
  {
    ...depositSettingsData,
    id: 'depositSettings',
    icon: Setting,
    subtitle: 'Deposit Settings',
    color: '#f59e0b',
    shadowColor: 'rgba(245,158,11,0.15)',
    imageUrl: '/images/manual/sales_invoice_1785990516203.png',
  },
  {
    ...invoiceData,
    id: 'invoice',
    icon: Tickets,
    subtitle: 'Invoices',
    color: '#10b981',
    shadowColor: 'rgba(16,185,129,0.15)',
    imageUrl: '/images/manual/sales_invoice_1785990516203.png',
  },
  {
    ...returnsData,
    id: 'returns',
    icon: RefreshLeft,
    subtitle: 'Returns',
    color: '#ef4444',
    shadowColor: 'rgba(239,68,68,0.15)',
    imageUrl: '/images/manual/reporting_charts_1785990538004.png',
  },
  {
    ...contractData,
    id: 'contract',
    icon: Document,
    subtitle: 'Contracts',
    color: '#8b5cf6',
    shadowColor: 'rgba(139,92,246,0.15)',
    imageUrl: '/images/manual/contract_management_1785990526494.png',
  },
  {
    ...productData,
    id: 'product',
    icon: Goods,
    subtitle: 'Products',
    color: '#3b82f6',
    shadowColor: 'rgba(59,130,246,0.15)',
    imageUrl: '/images/manual/workshop_kanban_1785990569362.png',
  },
  {
    ...logisticsData,
    id: 'logistics',
    icon: Van,
    subtitle: 'Logistics',
    color: '#14b8a6',
    shadowColor: 'rgba(20,184,166,0.15)',
    imageUrl: '/images/manual/workshop_kanban_1785990569362.png',
  },
  {
    ...statisticsData,
    id: 'statistics',
    icon: DataAnalysis,
    subtitle: 'Statistics',
    color: '#6366f1',
    shadowColor: 'rgba(99,102,241,0.15)',
    imageUrl: '/images/manual/reporting_charts_1785990538004.png',
  },
] as GuideSection[];
