import PDFDocument from 'pdfkit'
import { formatINR } from './pricing'
import { STAMP_IMAGE_BASE64 } from './stamp-image'

// Helper to format currency safely for PDF (replacing Unicode Rupee symbol with 'Rs. ' to avoid font rendering issues)
function formatINRForPDF(amount: number): string {
  return formatINR(amount).replace(/₹\s*/g, 'Rs. ')
}

// 1. Generate Invoice PDF Buffer using pdfkit
export function generateInvoicePdf(billData: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create document with margins matching the Apps Script layout (40px top/bottom, 48px left/right)
      const doc = new PDFDocument({
        margin: 48,
        size: 'A4',
      })
      const buffers: Buffer[] = []

      doc.on('data', (chunk) => buffers.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', (err) => reject(err))

      // ─── HEADER SECTION (Matching Apps Script PDF layout) ───
      // Georgia or Times Roman serif typeface style
      const titleFont = 'Times-Bold'
      const textFont = 'Times-Roman'
      const labelFont = 'Times-Bold'

      doc.font(titleFont).fontSize(26).fillColor('#b5541f').text('Nectar Ingredients', { align: 'left' })
      doc.font(textFont).fontSize(10).fillColor('#888888').text('Field to Powder Purity · Surendranagar, Gujarat', { align: 'left' })

      // Order Info in upper right
      const rightX = 350
      const startY = 48
      doc.font(labelFont).fontSize(11).fillColor('#2e2e2e').text('Order Ref:', rightX, startY, { align: 'right' })
      doc.font(textFont).text(billData.order_id.slice(0, 8), rightX, startY + 14, { align: 'right' })
      doc.text(new Date(billData.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), rightX, startY + 28, { align: 'right' })

      doc.moveDown(1.5)

      // Solid color line separator #b5541f
      doc.moveTo(48, doc.y).lineTo(547, doc.y).strokeColor('#b5541f').lineWidth(3).stroke()
      doc.moveDown(1.5)

      // Billed to / Delivery details
      const currentY = doc.y

      // Calculate heights to prevent overlap
      const addressHeight = doc.font(textFont).fontSize(10).heightOfString(billData.delivery_address, { width: 250, lineGap: 3 })
      const paymentText = `Payment Mode: ${billData.payment_method.toUpperCase()}\n` +
                          (billData.paytm_transaction_id ? `Txn ID: ${billData.paytm_transaction_id}` : '')
      const paymentHeight = doc.font(textFont).fontSize(10).heightOfString(paymentText, { width: 200, lineGap: 3 })

      // Render columns side-by-side using calculated heights
      doc.font(labelFont).fontSize(11).fillColor('#2e2e2e').text('Billed to:', 48, currentY)
      doc.font(textFont).fontSize(10).fillColor('#555555').text(billData.delivery_address, 48, currentY + 16, { width: 250, lineGap: 3 })

      // Payment Details (Right column)
      doc.font(labelFont).fontSize(11).fillColor('#2e2e2e').text('Payment Details:', rightX - 50, currentY)
      doc.font(textFont).fontSize(10).fillColor('#555555').text(paymentText, rightX - 50, currentY + 16, { width: 200, lineGap: 3 })

      // Calculate table starting Y position dynamically to prevent overlap
      const detailsHeight = Math.max(addressHeight, paymentHeight)
      let tableY = currentY + 16 + detailsHeight + 24 // 24px padding before table

      // ─── LINE ITEMS TABLE (Dark header #2e2e2e) ───
      doc.rect(48, tableY, 499, 25).fill('#2e2e2e')

      doc.font(labelFont).fontSize(10).fillColor('#ffffff')
      doc.text('Item', 58, tableY + 8)
      doc.text('Qty', 280, tableY + 8, { width: 60, align: 'center' })
      doc.text('Rate', 360, tableY + 8, { width: 80, align: 'right' })
      doc.text('Amount', 450, tableY + 8, { width: 85, align: 'right' })

      tableY += 25

      // Render Item Rows
      billData.items.forEach((item: any) => {
        doc.font(textFont).fontSize(10).fillColor('#2a2a2a')
        doc.text(item.name, 58, tableY + 8)
        doc.text(`${item.qty_kg} kg`, 280, tableY + 8, { width: 60, align: 'center' })
        doc.text(formatINRForPDF(item.final_price), 360, tableY + 8, { width: 80, align: 'right' })
        doc.text(formatINRForPDF(item.final_price * item.qty_kg), 450, tableY + 8, { width: 85, align: 'right' })

        doc.moveTo(48, tableY + 24).lineTo(547, tableY + 24).strokeColor('#eeeeee').lineWidth(1).stroke()
        tableY += 25
      })

      // ─── TOTALS SECTION (Dark total block matching Apps Script) ───
      tableY += 10
      doc.font(textFont).fontSize(10).fillColor('#666666')
      doc.text('Subtotal (List Total):', 250, tableY, { width: 180, align: 'right' })
      doc.text(formatINRForPDF(billData.list_total), 440, tableY, { width: 100, align: 'right' })
      tableY += 16

      doc.text(`Payment Discount (${(billData.payment_discount_pct * 100).toFixed(3)}%):`, 250, tableY, { width: 180, align: 'right' })
      doc.text(`-${formatINRForPDF(billData.list_total * billData.payment_discount_pct)}`, 440, tableY, { width: 100, align: 'right' })
      tableY += 20

      // Pinned total amount box in dark #2e2e2e
      doc.rect(298, tableY, 249, 44).fill('#2e2e2e')
      doc.font(textFont).fontSize(9).fillColor('#ffffff').text('TOTAL PAID', 312, tableY + 6, { align: 'left' })
      doc.font(labelFont).fontSize(18).fillColor('#ffffff').text(formatINRForPDF(billData.final_total), 312, tableY + 18, { width: 220, align: 'left' })

      tableY += 60

      // ─── FOOTER & STAMP INTEGRATION ───
      // Add a line separator
      doc.moveTo(48, tableY).lineTo(547, tableY).strokeColor('#eeeeee').lineWidth(1).stroke()
      tableY += 15

      // Left footer text (Checkmark character '✓' removed to avoid rendering as superscript '1' in PDF standard fonts)
      doc.font(labelFont).fontSize(11).fillColor('#2e7d32').text('Payment Verified — Dispatched', 48, tableY)
      doc.font(textFont).fontSize(9).fillColor('#999999').text('Thank you for choosing Nectar Ingredients.', 48, tableY + 16)

      // Right footer stamp image
      if (STAMP_IMAGE_BASE64) {
        try {
          doc.image(Buffer.from(STAMP_IMAGE_BASE64, 'base64'), 430, tableY - 10, { width: 110 })
        } catch (imgErr) {
          console.error('Failed to render PDF stamp image:', imgErr)
        }
      }

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

// 2. Parse delivery_address block to extract client's name and email
function parseAddressDetails(addressString: string) {
  const lines = addressString.split('\n')
  const name = lines[0] || 'Customer'

  const emailLine = lines.find((line) => line.toLowerCase().startsWith('email:'))
  const email = emailLine ? emailLine.split(/email:/i)[1]?.trim() : null

  return { name, email }
}

// 3. Send invoice email via Brevo transactional API with base64 PDF attachment
export async function sendInvoiceEmail(billData: any): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.error('Email aborted: BREVO_API_KEY not configured in env')
    return false
  }

  const { name, email } = parseAddressDetails(billData.delivery_address)
  if (!email) {
    console.error('Email aborted: Could not parse customer email from delivery address')
    return false
  }

  try {
    // Generate invoice PDF
    const pdfBuffer = await generateInvoicePdf(billData)
    const base64Pdf = pdfBuffer.toString('base64')

    // Create Brevo payload (Matching your exact sending & reply-to configuration)
    const payload = {
      sender: { name: 'Nectar Ingredients', email: 'sales@nectaringredients.work.gd' },
      to: [{ email, name }],
      replyTo: { name: 'Nectar Ingredients', email: 'nectaringredients@gmail.com' },
      subject: `Order Confirmed & Invoice — Nectar Ingredients [Order ID: ${billData.order_id.slice(0, 8)}]`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 8px; color: #333333; line-height: 1.6;">
          <h2 style="color: #b5541f; border-bottom: 2px solid #b5541f; padding-bottom: 10px; margin-top: 0;">Nectar Ingredients</h2>
          <p>Hello ${name},</p>
          <p>Thank you for your order with <strong>Nectar Ingredients</strong>. We have received your payment, and your order <strong>${billData.order_id.slice(0, 8)}</strong> has been verified and is being dispatched.</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <tr style="background-color: #f8f8f8;">
              <th style="padding: 10px; text-align: left; border: 1px solid #dddddd; font-weight: bold;">Order Reference</th>
              <td style="padding: 10px; border: 1px solid #dddddd; font-family: monospace;">${billData.order_id.slice(0, 8)}</td>
            </tr>
            <tr>
              <th style="padding: 10px; text-align: left; border: 1px solid #dddddd; font-weight: bold;">Amount Paid</th>
              <td style="padding: 10px; border: 1px solid #dddddd; font-weight: bold; color: #b5541f;">${formatINR(billData.final_total)}</td>
            </tr>
            <tr style="background-color: #f8f8f8;">
              <th style="padding: 10px; text-align: left; border: 1px solid #dddddd; font-weight: bold;">Payment Method</th>
              <td style="padding: 10px; border: 1px solid #dddddd; text-transform: uppercase;">${billData.payment_method}</td>
            </tr>
          </table>

          <p>We have attached your official PDF invoice and order summary directly to this email for your records.</p>
          <p>If you have any questions or require custom assistance, feel free to reply to this email.</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999999; text-align: center;">Thank you for choosing Nectar Ingredients.</p>
        </div>
      `,
      attachment: [
        {
          content: base64Pdf,
          name: `Invoice-${billData.order_id.slice(0, 8)}.pdf`,
        },
      ],
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorMsg = await response.text()
      throw new Error(`Brevo API returned error: ${response.status} — ${errorMsg}`)
    }

    console.log(`Invoice email with PDF attachment dispatched successfully to ${email} for order ${billData.order_id}`)
    return true
  } catch (error) {
    console.error('Failed to send invoice email:', error)
    return false
  }
}
