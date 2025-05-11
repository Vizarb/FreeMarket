import { CartOverviewResponse } from '../types/apiResponseType';

export function calculateCartSummary(items: CartOverviewResponse[]) {
  const itemCount = items.reduce((sum, item) => sum + item.total_quantity, 0);
  const total = items.reduce((sum, item) => sum + item.total_quantity * item.latest_price, 0);
  return { itemCount, total };
}
