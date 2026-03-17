export type ServiceType = 'plumbing' | 'electrical' | 'ac_repair' | 'generator' | 'carpentry' | 'cleaning' | 'fumigation' | 'makeup' | 'mechanic' | 'painting' | 'tiling' | 'welding' | 'cctv';

interface PriceRange {
  min: number;
  max: number;
}

const PRICE_TABLE: Record<ServiceType, PriceRange> = {
  plumbing:    { min: 10000, max: 35000 },
  electrical:  { min: 8000,  max: 30000 },
  ac_repair:   { min: 15000, max: 50000 },
  generator:   { min: 10000, max: 45000 },
  carpentry:   { min: 12000, max: 40000 },
  cleaning:    { min: 15000, max: 50000 },
  fumigation:  { min: 20000, max: 60000 },
  makeup:      { min: 30000, max: 150000 },
  mechanic:    { min: 15000, max: 80000 },
  painting:    { min: 10000, max: 40000 },
  tiling:      { min: 15000, max: 40000 },
  welding:     { min: 10000, max: 50000 },
  cctv:        { min: 30000, max: 100000 },
};

// Keywords that push estimate toward the high end
const HIGH_KEYWORDS = ['replace', 'install', 'new', 'overhaul', 'rewire', 'compressor', 'rebuild'];
const LOW_KEYWORDS = ['fix', 'repair', 'leak', 'minor', 'check', 'service', 'clean'];

export function estimatePrice(serviceType: ServiceType, description?: string, emergency?: boolean): PriceRange | null {
  const base = PRICE_TABLE[serviceType];
  if (!base) return null;

  let { min, max } = base;

  // Narrow range based on description keywords
  if (description) {
    const lower = description.toLowerCase();
    const isHigh = HIGH_KEYWORDS.some(k => lower.includes(k));
    const isLow = LOW_KEYWORDS.some(k => lower.includes(k));
    const mid = (min + max) / 2;
    if (isHigh && !isLow) min = Math.round(mid);
    else if (isLow && !isHigh) max = Math.round(mid);
  }

  // Emergency surge: 1.5x
  if (emergency) {
    min = Math.round(min * 1.5);
    max = Math.round(max * 1.5);
  }

  return { min, max };
}

const LOYALTY_THRESHOLD = 3;
const LOYALTY_DISCOUNT = 0.05; // 5%

export function applyLoyaltyDiscount(price: number, completedJobs: number): number {
  return completedJobs >= LOYALTY_THRESHOLD ? Math.round(price * (1 - LOYALTY_DISCOUNT)) : price;
}

export { PRICE_TABLE };
