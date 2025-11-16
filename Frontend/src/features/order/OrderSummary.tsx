import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, FileDown, RefreshCcw, MessageSquare } from 'lucide-react';
import { OrderDetailsResponse, OrderItemDetailsResponse } from '@/types/apiResponseType';

type OrderItemWithExtras = OrderItemDetailsResponse & {
  slug?: string;
  item_slug?: string;
  image?: string;       // e.g. "/media/items/xyz.jpg"
  image_url?: string;   // e.g. full URL if your API returns it
  currency?: string;
};

interface OrderSummaryProps {
  order: OrderDetailsResponse;
  onReorder?: (orderId: number) => void;
  onDownloadInvoice?: (orderId: number) => void;
  onContactSeller?: (orderId: number) => void;
}

const centsToMoney = (cents: number, currency?: string) =>
  `${(cents / 100).toFixed(2)}${currency ? ` ${currency}` : ''}`;

const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  onReorder,
  onDownloadInvoice,
  onContactSeller,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const firstItem = order.order_items[0] as OrderItemWithExtras | undefined;

  const itemSlugOrId = useMemo(() => {
    if (!firstItem) return '';
    return firstItem.slug ?? firstItem.item_slug ?? String(firstItem.item_id);
  }, [firstItem]);

  const itemHref = useMemo(() => (itemSlugOrId ? `/items/${itemSlugOrId}` : '#'), [itemSlugOrId]);

  const imageUrl = useMemo(() => {
    if (!firstItem) return '/placeholder.jpg';
    const raw = firstItem.image_url ?? firstItem.image ?? '';
    if (!raw) return '/placeholder.jpg';
    // If API returns a relative path, prefix with backend URL; if full URL, use as is.
    const isFull = /^https?:\/\//i.test(raw);
    const base = import.meta.env.VITE_BACKEND_URL ?? '';
    return isFull ? raw : `${base}${raw}`;
  }, [firstItem]);

  const currency = (firstItem && firstItem.currency) || undefined;

  return (
    <div className="border rounded-xl p-4 shadow flex flex-col bg-white dark:bg-zinc-900 h-full min-h-[460px] max-h-[460px]">
      {/* Media header like ItemCard */}
      <img
        src={imageUrl}
        alt={firstItem ? firstItem.item_name : `Order #${order.id}`}
        className="w-full h-40 sm:h-48 object-cover rounded-lg mb-3"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.jpg';
        }}
      />

      {/* Headline mirrors ItemCard: link to the FIRST ITEM details */}
      <Link
        to={itemHref}
        className="text-lg font-bold text-blue-600 hover:underline"
      >
        {firstItem ? firstItem.item_name : `Order #${order.id}`}
      </Link>

      {/* Order number + toggle, status pill */}
      <div className="mt-1 flex items-center justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Order #{order.id}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {order.status}
          </span>
          <button
            className="text-indigo-600 hover:underline flex items-center"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-controls={`order-items-${order.id}`}
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Collapsible items list */}
      {isOpen && (
        <ul id={`order-items-${order.id}`} className="my-3 space-y-2 overflow-auto">
          {order.order_items.map((raw) => {
            const item = raw as OrderItemWithExtras;
            const slugOrId = item.slug ?? item.item_slug ?? String(item.item_id);
            const href = `/items/${slugOrId}`;
            return (
              <li
                key={`${item.item_id}-${item.order_id}`}
                className="flex justify-between gap-3 border-b border-gray-200 dark:border-zinc-700 pb-2 text-sm sm:text-base"
              >
                <Link to={href} className="truncate text-blue-600 hover:underline">
                  {item.item_name}
                </Link>
                <span className="shrink-0">Qty: {item.quantity}</span>
                <span className="shrink-0">
                  {centsToMoney(item.price_cents * item.quantity, item.currency ?? currency)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Meta + total */}
      <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
        Ordered on: {new Date(order.created_at).toLocaleDateString()}
      </div>
      <div className="mt-1 font-semibold">
        Total: {centsToMoney(order.total_price_cents, currency)}
      </div>

      {/* Footer actions like ItemCard CTA */}
      <div className="mt-auto pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Link
          to={`/orders/${order.id}`}
          className="inline-flex items-center justify-center border rounded-lg py-2 px-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800"
        >
          View details
        </Link>
        <button
          onClick={() => onDownloadInvoice?.(order.id)}
          className="inline-flex items-center justify-center border rounded-lg py-2 px-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800"
        >
          <FileDown size={16} className="mr-1" />
          Invoice
        </button>
        <button
          onClick={() => onReorder?.(order.id)}
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-3 text-sm"
        >
          <RefreshCcw size={16} className="mr-1" />
          Reorder
        </button>
        <button
          onClick={() => onContactSeller?.(order.id)}
          className="inline-flex items-center justify-center border rounded-lg py-2 px-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800"
        >
          <MessageSquare size={16} className="mr-1" />
          Contact seller
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
