export const STORE = {
  name: 'Harsh Trending Cloth',
  tagline: 'Premium Fashion, Defined.',
  phone: '+91 9911614710',
  phoneShort: '9911614710',
  email: 'harshrajoriya2717@gmail.com',
  address: {
    line1: 'Vijay Nagar',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    pincode: '201009',
  },
  social: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    youtube: 'https://youtube.com',
  },
};

export const GST_RATE = 0.05; // 5% GST on apparel
export const FREE_DELIVERY_THRESHOLD = 1499;
export const DELIVERY_FLAT = 79;

export function formatINR(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function discountedPercent(price: number, mrp?: number | null): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
