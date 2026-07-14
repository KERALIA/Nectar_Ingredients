'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function PayRedirectInner() {
  const params = useSearchParams();
  const [upiLink, setUpiLink] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const pa = params.get('pa') || '';
    const pn = params.get('pn') || '';
    const am = params.get('am') || '';
    const tn = params.get('tn') || '';

    const link =
      `upi://pay?pa=${encodeURIComponent(pa)}` +
      `&pn=${encodeURIComponent(pn)}` +
      `&am=${am}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent(tn)}`;

    setUpiLink(link);
    setAmount(am);

    // Give the page a beat to paint before handing off to the UPI app
    const t = setTimeout(() => {
      window.location.href = link;
    }, 150);
    return () => clearTimeout(t);
  }, [params]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#111',
        color: '#eee',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        paddingTop: '70px',
      }}
    >
      <p style={{ fontSize: '15px' }}>
        Opening your UPI app to complete payment of Rs. {amount || '...'}
      </p>
      <a
        href={upiLink || '#'}
        style={{
          color: '#fff',
          background: '#b5541f',
          padding: '14px 28px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '16px',
          display: 'inline-block',
          marginTop: '24px',
        }}
      >
        Tap here if it doesn&apos;t open automatically
      </a>
      <p style={{ color: '#999', fontSize: '13px', marginTop: '30px', padding: '0 20px' }}>
        This only works on a phone with a UPI app installed (Google Pay, PhonePe, Paytm, etc).
        Opening on a desktop won&apos;t do anything — pay from your phone instead.
      </p>
    </div>
  );
}

export default function PayRedirectPage() {
  return (
    <Suspense fallback={<div style={{ background: '#111', minHeight: '100vh' }} />}>
      <PayRedirectInner />
    </Suspense>
  );
}
