import { Client } from 'postmark';

// Initialize Postmark client
const postmarkClient = new Client(import.meta.env.VITE_POSTMARK_API_TOKEN || '');

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    await postmarkClient.sendEmail({
      From: import.meta.env.VITE_POSTMARK_FROM_EMAIL || 'notifications@youbuy.com',
      To: to,
      Subject: subject,
      HtmlBody: html,
      MessageStream: 'outbound'
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendPurchaseNotification = async (sellerEmail: string, productTitle: string, buyerName: string) => {
  const subject = 'Your product has been purchased!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Congratulations! Your product has been purchased</h2>
      <p>Hello,</p>
      <p>We're excited to let you know that your product <strong>${productTitle}</strong> has been purchased by ${buyerName}.</p>
      <p>Please prepare the item for delivery and update the order status in your dashboard.</p>
      <p>Best regards,<br>The YouBuy Team</p>
    </div>
  `;

  return sendEmail({ to: sellerEmail, subject, html });
};

export const sendDeliveryNotification = async (buyerEmail: string, productTitle: string, trackingNumber?: string) => {
  const subject = 'Your order is on its way!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Your order is being delivered</h2>
      <p>Hello,</p>
      <p>Your order for <strong>${productTitle}</strong> is on its way to you!</p>
      ${trackingNumber ? `<p>Tracking number: ${trackingNumber}</p>` : ''}
      <p>You can track your order status in your dashboard.</p>
      <p>Best regards,<br>The YouBuy Team</p>
    </div>
  `;

  return sendEmail({ to: buyerEmail, subject, html });
}; 