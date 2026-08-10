import type { GuideSection } from './guideData';
import {
  DataAnalysis,
  Picture,
  Document,
  ChatDotRound,
  Message,
  User,
  Van,
} from '@element-plus/icons-vue';

import { sectionData as dashboardData } from '../sections/dashboardData';
import { sectionData as bannerData } from '../sections/bannerData';
import { sectionData as articleData } from '../sections/articleData';
import { sectionData as commentData } from '../sections/commentData';
import { sectionData as contactData } from '../sections/contactData';
import { sectionData as customerData } from '../sections/customerData';
import { sectionData as bookingData } from '../sections/bookingData';

export const guideSections: GuideSection[] = [
  {
    ...dashboardData,
    id: 'dashboard',
    icon: DataAnalysis,
    subtitle: 'Dashboard',
    color: '#6366f1',
    shadowColor: 'rgba(99,102,241,0.15)',
    imageUrl: '/images/manual/acc_dashboard_1785991209802.png',
  },
  {
    ...bannerData,
    id: 'banner',
    icon: Picture,
    subtitle: 'Banners',
    color: '#0284c7',
    shadowColor: 'rgba(2,132,199,0.15)',
    imageUrl: '/images/manual/acc_financial_1785991220484.png',
  },
  {
    ...articleData,
    id: 'article',
    icon: Document,
    subtitle: 'Blog & SEO',
    color: '#d97706',
    shadowColor: 'rgba(217,119,6,0.15)',
    imageUrl: '/images/manual/acc_inventory_1785991230022.png',
  },
  {
    ...commentData,
    id: 'comment',
    icon: ChatDotRound,
    subtitle: 'Comments',
    color: '#2563eb',
    shadowColor: 'rgba(37,99,235,0.15)',
    imageUrl: '/images/manual/acc_workshop_1785991240428.png',
  },
  {
    ...contactData,
    id: 'contact',
    icon: Message,
    subtitle: 'Contact',
    color: '#db2777',
    shadowColor: 'rgba(219,39,119,0.15)',
    imageUrl: '/images/manual/acc_customer_1785991252984.png',
  },
  {
    ...customerData,
    id: 'customer',
    icon: User,
    subtitle: 'Loyalty',
    color: '#059669',
    shadowColor: 'rgba(5,150,105,0.15)',
    imageUrl: '/images/manual/hr_employee_list_1785990547958.png',
  },
  {
    ...bookingData,
    id: 'booking',
    icon: Van,
    subtitle: 'Test Drive',
    color: '#7c3aed',
    shadowColor: 'rgba(124,58,237,0.15)',
    imageUrl: '/images/manual/contract_management_1785990526494.png',
  },
] as GuideSection[];
