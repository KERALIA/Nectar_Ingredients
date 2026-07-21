'use client'

import React from 'react'
import { formatINR } from '@/lib/pricing'

interface BillViewerProps {
  billData: any
  onClose: () => void
}

export default function BillViewer({ billData, onClose }: BillViewerProps) {
  if (!billData) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-ni-surface border border-ni-border/20 rounded-2xl w-full max-w-2xl shadow-premium animate-fade-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ni-border/10 flex justify-between items-center">
          <h3 className="font-heading text-base font-bold text-ni-primary uppercase tracking-wider">
            Invoice Summary
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center font-body text-sm text-ni-muted hover:text-ni-primary hover:bg-ni-surface2 transition-all rounded-full cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 font-body text-sm text-ni-secondary leading-relaxed">
          {/* Printable Invoice Container */}
          <div className="border border-ni-border/25 rounded-xl p-5 bg-ni-surface2/10 relative overflow-hidden">
            {/* Header info */}
            <div className="text-center border-b border-ni-border/15 pb-4 mb-4">
              <h2 className="font-heading text-lg font-bold text-ni-primary">
                NECTAR INGREDIENTS
              </h2>
              <p className="text-[10px] text-ni-muted uppercase tracking-widest mt-0.5">
                Surendranagar, Gujarat, India
              </p>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-4">
              <div>
                <span className="block font-bold text-ni-muted uppercase tracking-wider text-[9px] mb-1">
                  Invoice Details
                </span>
                <p><span className="font-semibold">Invoice ID:</span> {billData.order_id.slice(0, 8)}</p>
                <p><span className="font-semibold">Date:</span> {new Date(billData.date).toLocaleDateString('en-IN')}</p>
                <p><span className="font-semibold">Payment Mode:</span> {billData.payment_method?.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <span className="block font-bold text-ni-muted uppercase tracking-wider text-[9px] mb-1">
                  Reference
                </span>
                {billData.paytm_transaction_id && (
                  <p className="truncate"><span className="font-semibold">Txn ID:</span> {billData.paytm_transaction_id}</p>
                )}
                {billData.paytm_order_id && (
                  <p className="truncate"><span className="font-semibold">Gateway ID:</span> {billData.paytm_order_id}</p>
                )}
              </div>
            </div>

            {/* Delivery address details */}
            <div className="border-t border-b border-ni-border/15 py-3 my-4 text-xs">
              <span className="block font-bold text-ni-muted uppercase tracking-wider text-[9px] mb-1.5">
                Delivery Details
              </span>
              <p className="whitespace-pre-wrap leading-relaxed text-ni-secondary">
                {billData.delivery_address}
              </p>
            </div>

            {/* Items table */}
            <div className="space-y-2 mt-4">
              <span className="block font-bold text-ni-muted uppercase tracking-wider text-[9px] mb-2">
                Purchased Items
              </span>
              <div className="divide-y divide-ni-border/10 border-b border-ni-border/10">
                {billData.items?.map((item: any) => (
                  <div key={item.sku} className="flex justify-between items-center py-2.5 text-xs">
                    <div className="min-w-0 pr-4">
                      <span className="block font-bold text-ni-primary truncate">
                        {item.name}
                      </span>
                      <span className="block font-mono text-[9px] text-ni-muted mt-0.5">
                        {item.sku} · {item.qty_kg} kg @ {formatINR(item.final_price)}/kg
                      </span>
                    </div>
                    <span className="font-bold text-ni-secondary flex-shrink-0">
                      {formatINR(item.final_price * item.qty_kg)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary calculations */}
            <div className="flex flex-col items-end gap-1.5 mt-4 text-xs text-ni-muted">
              <div>
                <span>List Total: </span>
                <span className="font-semibold text-ni-primary">{formatINR(billData.list_total)}</span>
              </div>
              <div className="text-red-500">
                <span>Discount ({(billData.payment_discount_pct * 100).toFixed(3)}%): </span>
                <span>−{formatINR(billData.list_total * billData.payment_discount_pct)}</span>
              </div>
              <div className="text-sm font-bold text-ni-primary border-t border-ni-border/15 pt-2 mt-1 w-full text-right">
                <span>Total Amount Paid: </span>
                <span className="text-ni-rust">{formatINR(billData.final_total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-ni-border/10 flex justify-end gap-3 bg-ni-surface2/10 rounded-b-2xl">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[9px] px-5 py-2.5 bg-transparent border border-ni-border2 text-ni-secondary hover:border-ni-secondary hover:text-ni-primary transition-all duration-300 cursor-pointer"
          >
            🖨️ Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[9px] px-5 py-2.5 bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-premium transition-all duration-300 cursor-pointer"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  )
}
