export interface Plate {
  id: string;
  plateNumber: string;
  price: number;
  isSold: boolean;
  category?: string;
  addedDate: string;
}

export type PlateCategory = '2 DIGIT' | '3 DIGIT' | '4 DIGIT' | 'CLASSIC' | 'GOLDEN NUMBER' | 'OFFER';

export type UserRole = 'user' | 'dealer' | 'admin';