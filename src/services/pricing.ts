export type ServiceType = 'plumbing' | 'electrical' | 'ac_repair' | 'generator' | 'carpentry';

interface PriceRange {
  min: number;
  max: number;
}

const PRICE_TABLE: Record<ServiceType, PriceRange> = {
  plumbing:   { min: 10000, max: 35000 },
  electrical: { min: 8000,  max: 30000 },
  ac_repair:  { min: 15000, max: 50000 },
  generator:  { min: 10000, max: 45000 },
  carpentry:  { min: 12000, max: 40000 },
};

export function estimatePrice(serviceType: ServiceType): PriceRange | null {
  return PRICE_TABLE[serviceType] || null;
}

export { PRICE_TABLE };
