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
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankAccNumber = "42110001905";
  const bankIfscCode = "SBIN0006498";
  const bankName = "State Bank of India";
  const bankAccName = "Nectar Ingredients";

  useEffect(() => {
    const payeePa = params.get('pa') || 'aumkeralia406-1@oksbi';
    const payeePn = params.get('pn') || 'Nectar Ingredients';
    const am = params.get('am') || '';
    const tn = params.get('tn') || '';

    const paramCopyAcc = params.get('copyAcc');
    const paramCopyIfsc = params.get('copyIfsc');
    const paramCopyUpi = params.get('copyUpi');

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

    // Check for auto-copy requests from email links
    if (paramCopyAcc && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(paramCopyAcc);
      setCopiedField('Account Number');
    } else if (paramCopyIfsc && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(paramCopyIfsc);
      setCopiedField('IFSC Code');
    } else if (paramCopyUpi && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(payeePa);
      setCopiedField('UPI ID');
    }

    // Detect if user agent is a mobile device
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(mobileCheck);

    // If mobile and not just copying, auto-launch the UPI app after a brief delay
    if (mobileCheck && !paramCopyAcc && !paramCopyIfsc && !paramCopyUpi) {
      const t = setTimeout(() => {
        window.location.href = link;
      }, 200);
      return () => clearTimeout(t);
    }
  }, [params]);

  const copyToClipboard = (text: string, label: string) => {
    if (!text || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
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
          maxWidth: '480px',
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
          Payment Checkout & Copy Details
        </p>

        {copiedField && (
          <div
            style={{
              background: '#065f46',
              color: '#a7f3d0',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '16px',
              border: '1px solid #059669',
            }}
          >
            📋 {copiedField} Copied to Clipboard!
          </div>
        )}

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

        {/* ALWAYS SHOW UPI APP BUTTON (FOR MOBILE / ANDROID / IOS) */}
        <div style={{ marginBottom: '24px' }}>
          <a
            href={upiLink || '#'}
            style={{
              color: '#ffffff',
              background: '#ea580c',
              padding: '16px 28px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '17px',
              fontWeight: 'bold',
              display: 'block',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.45)',
              textAlign: 'center',
            }}
          >
            ⚡ Pay via UPI App (GPay / PhonePe / Paytm)
          </a>
          <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '8px' }}>
            Tap above on Android/iOS to launch your installed UPI app.
          </p>
        </div>

        {/* DESKTOP / ALTERNATIVE: DYNAMIC QR CODE */}
        <div
          style={{
            background: '#111827',
            padding: '16px 12px',
            borderRadius: '12px',
            border: '1px solid #374151',
            marginBottom: '20px',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#e5e7eb', margin: '0 0 12px' }}>
            Scan QR Code with GPay, PhonePe, Paytm, or BHIM
          </p>

          {qrImageUrl && (
            <div
              style={{
                background: '#ffffff',
                padding: '10px',
                borderRadius: '12px',
                display: 'inline-block',
                border: '2px solid #ea580c',
                marginBottom: '10px',
              }}
            >
              <img
                src={qrImageUrl}
                alt="UPI Payment QR Code"
                style={{ width: '200px', height: '200px', display: 'block' }}
              />
            </div>
          )}
        </div>

        {/* UPI ID COPY BOX */}
        {pa && (
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
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
                onClick={() => copyToClipboard(pa, 'UPI ID')}
                style={{
                  background: copiedField === 'UPI ID' ? '#10b981' : '#ea580c',
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
                {copiedField === 'UPI ID' ? '✓ Copied!' : '📋 Copy UPI ID'}
              </button>
            </div>
          </div>
        )}

        {/* DIRECT BANK TRANSFER DETAILS BOX WITH READY TO COPY BUTTONS */}
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            background: '#111827',
            border: '1px solid #374151',
            borderRadius: '12px',
            textAlign: 'left',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#f97316', margin: '0 0 10px' }}>
            🏦 Bank Transfer Details (NEFT / RTGS / IMPS)
          </p>

          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>Account Name:</span>
              <strong style={{ color: '#f3f4f6' }}>{bankAccName}</strong>
            </div>

            <div>
              <span style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>Account Number:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <code style={{ background: '#1f2937', color: '#10b981', padding: '4px 10px', borderRadius: '4px', border: '1px solid #374151', fontWeight: 'bold', fontSize: '14px' }}>
                  {bankAccNumber}
                </code>
                <button
                  onClick={() => copyToClipboard(bankAccNumber, 'Account Number')}
                  style={{
                    background: copiedField === 'Account Number' ? '#10b981' : '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  {copiedField === 'Account Number' ? '✓ Copied!' : '📋 Copy Acc No'}
                </button>
              </div>
            </div>

            <div>
              <span style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>IFSC Code:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <code style={{ background: '#1f2937', color: '#10b981', padding: '4px 10px', borderRadius: '4px', border: '1px solid #374151', fontWeight: 'bold', fontSize: '14px' }}>
                  {bankIfscCode}
                </code>
                <button
                  onClick={() => copyToClipboard(bankIfscCode, 'IFSC Code')}
                  style={{
                    background: copiedField === 'IFSC Code' ? '#10b981' : '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  {copiedField === 'IFSC Code' ? '✓ Copied!' : '📋 Copy IFSC'}
                </button>
              </div>
            </div>

            <div>
              <span style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>Bank Name:</span>
              <span style={{ color: '#e5e7eb' }}>{bankName}</span>
            </div>
          </div>
        </div>

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
