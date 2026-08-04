'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function PayRedirectInner() {
  const params = useSearchParams();
  const [upiLink, setUpiLink] = useState('');
  const [pa, setPa] = useState('');
  const [pn, setPn] = useState('');
  const [amount, setAmount] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const payeePa = params.get('pa') || '';
    const payeePn = params.get('pn') || '';
    const am = params.get('am') || '';
    const tn = params.get('tn') || '';

    setPa(payeePa);
    setPn(payeePn);
    setAmount(am);
    setOrderRef(tn);

    const link =
      `upi://pay?pa=${encodeURIComponent(payeePa)}` +
      `&pn=${encodeURIComponent(payeePn)}` +
      `&am=${am}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent(tn)}`;

    setUpiLink(link);

    // Detect if user agent is a mobile device
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(mobileCheck);

    // If mobile, auto-launch the UPI app after a brief delay
    if (mobileCheck) {
      const t = setTimeout(() => {
        window.location.href = link;
      }, 200);
      return () => clearTimeout(t);
    }
  }, [params]);

  const copyUpiId = () => {
    if (!pa) return;
    navigator.clipboard.writeText(pa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrImageUrl = upiLink
    ? `https://quickchart.io/qr?text=${encodeURIComponent(upiLink)}&size=260`
    : '';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#111827',
        color: '#f9fafb',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        padding: '40px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          background: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '16px',
          padding: '28px 20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        }}
      >
        <h2 style={{ color: '#ea580c', margin: '0 0 6px', fontSize: '22px' }}>
          {pn || 'Nectar Ingredients'}
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px' }}>
          Payment Checkout
        </p>

        {amount && (
          <div
            style={{
              background: '#111827',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid #374151',
              marginBottom: '20px',
            }}
          >
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 4px' }}>
              Amount Payable
            </p>
            <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
              ₹{amount}
            </p>
            {orderRef && (
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '6px 0 0' }}>
                {orderRef}
              </p>
            )}
          </div>
        )}

        {isMobile ? (
          /* MOBILE VIEW: Auto-hand off + button */
          <div>
            <p style={{ fontSize: '15px', color: '#e5e7eb', marginBottom: '20px' }}>
              Opening your UPI app (Google Pay, PhonePe, Paytm)...
            </p>
            <a
              href={upiLink || '#'}
              style={{
                color: '#ffffff',
                background: '#ea580c',
                padding: '14px 28px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'inline-block',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)',
              }}
            >
              Pay via UPI App
            </a>
            <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '16px' }}>
              Tap above if your UPI app did not open automatically.
            </p>
          </div>
        ) : (
          /* DESKTOP VIEW: Display Dynamic QR Code */
          <div>
            <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#e5e7eb', marginBottom: '14px' }}>
              Scan QR Code to Pay
            </p>

            {qrImageUrl && (
              <div
                style={{
                  background: '#ffffff',
                  padding: '12px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  border: '2px solid #ea580c',
                  marginBottom: '16px',
                }}
              >
                <img
                  src={qrImageUrl}
                  alt="UPI Payment QR Code"
                  style={{ width: '220px', height: '220px', display: 'block' }}
                />
              </div>
            )}

            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 16px', lineHeight: '1.4' }}>
              Open <strong>Google Pay, PhonePe, Paytm, or BHIM</strong> on your phone and scan this QR code to complete payment.
            </p>
          </div>
        )}

        {/* UPI ID COPY BOX (Available for both mobile & desktop) */}
        {pa && (
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #374151',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px' }}>
              UPI ID (VPA):
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <code
                style={{
                  background: '#111827',
                  color: '#ea580c',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #4b5563',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {pa}
              </code>
              <button
                onClick={copyUpiId}
                style={{
                  background: copied ? '#10b981' : '#374151',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PayRedirectPage() {
  return (
    <Suspense fallback={<div style={{ background: '#111827', minHeight: '100vh' }} />}>
      <PayRedirectInner />
    </Suspense>
  );
}
