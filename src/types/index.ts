export interface User {
  id: string;
  name: string;
  email: string;
  role: 'household' | 'social_worker' | 'association' | 'beneficiary';
  verified: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  urgent: boolean;
  addedBy: string;
}

export interface DonationRequest {
  id: string;
  items: ShoppingItem[];
  beneficiaryId: string;
  socialWorkerId: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'collected';
  anonymous: boolean;
  createdAt: Date;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  expirationDate: Date;
  criticalLevel: number;
  location: string;
}

export interface QRCode {
  id: string;
  beneficiaryId: string;
  donationRequestId: string;
  items: ShoppingItem[];
  validUntil: Date;
  used: boolean;
}

export interface Beneficiary {
  id: string;
  name: string;
  familySize: number;
  socialWorkerId: string;
  verified: boolean;
  history: {
    collected: DonationRequest[];
    pending: DonationRequest[];
    rejected: DonationRequest[];
  };
}