import type { Component } from 'vue';

export interface GuidePage {
  id: string;
  title: string;
  route?: string;
  description?: string;
  steps: string[];
  tips?: string[];
  permission?: string;
}

export interface GuideSection {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  icon: Component;
  color: string;
  shadowColor: string;
  route?: string;
  pages?: GuidePage[];
  imageUrl?: string;
}
export interface FeatureItem {
  title: string;
  description: string;
}
