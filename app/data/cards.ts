export interface VirtualCard {
  id: string;
  bin: string;
  provider: string;
  type: string;
  expiry: string;
  name: string;
  country: string;
  countryFlag: string;
  street?: string;
  city?: string;
  state: string;
  address: string;
  zip: string;
  extras: string | null;
  bank: string;
  cardholderName?: string | null;
  price: number;
  limit: number;
  validUntil: string;
  inStock: boolean;
  stock?: number;
  color: string;
  isValid?: boolean;
  tag?: string | null;
}
