import React from 'react';
import { CymbalMartAssistant } from './CymbalMartAssistant';
import { PartyPlan, ShoppingItem } from '../types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan | null;
  onAddCustomItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
  onNavigateTab?: (tab: 'define' | 'review' | 'refine_checkout' | 'menu' | 'timeline' | 'overview') => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = (props) => {
  return <CymbalMartAssistant {...props} />;
};

export { CymbalMartAssistant };
