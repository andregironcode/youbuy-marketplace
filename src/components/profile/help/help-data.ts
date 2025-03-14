
import { 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  User, 
  HelpCircle, 
  Star,
} from "lucide-react";

export const helpCategories = [
  {
    id: "orders",
    title: "Orders",
    icon: ShoppingBag,
    description: "Get help with your purchases and order status"
  },
  {
    id: "shipping",
    title: "Shipping",
    icon: Truck,
    description: "Information about shipping methods and delivery"
  },
  {
    id: "payments",
    title: "Payments",
    icon: CreditCard,
    description: "Help with payment methods and transactions"
  },
  {
    id: "account",
    title: "Account",
    icon: User,
    description: "Managing your account settings and preferences"
  },
  {
    id: "general",
    title: "General Help",
    icon: HelpCircle,
    description: "Common questions about using YouBuy"
  },
  {
    id: "premium",
    title: "YouBuy Premium",
    icon: Star,
    description: "Features and benefits of YouBuy Premium subscription"
  }
];

export const helpArticles = [
  {
    id: "track-order",
    title: "How to track your order",
    category: "orders",
    content: `
# Tracking Your Order

After making a purchase on YouBuy, you can easily track the status and location of your order.

## Where to Find Tracking Information

1. Log in to your YouBuy account
2. Go to the "Purchases" section in your profile
3. Find the order you want to track
4. Click on "View Details"

## Understanding Order Statuses

Your order will progress through these statuses:

- **Pending**: The seller has received your order but hasn't processed it yet
- **Processing**: The seller is preparing your order for shipment
- **Shipped**: Your order has been handed off to the delivery service
- **Out for Delivery**: Your package is on its way to you
- **Delivered**: Your package has been delivered

## Tracking Numbers

If the seller has provided a tracking number, you'll see it on the order details page. Click on the tracking number to be redirected to the carrier's tracking page for real-time updates.

## What to Do If Your Package Is Delayed

If your package hasn't arrived by the estimated delivery date:

1. Check the tracking information for any updates
2. Contact the seller through the YouBuy messaging system
3. If you don't receive a response within 48 hours, you can open a support ticket

We're always here to help ensure you receive your purchases promptly!
    `,
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-07-22'),
    viewCount: 1256,
    published: true
  },
  {
    id: "cancel-order",
    title: "How to cancel an order",
    category: "orders",
    content: `
# Canceling Your Order

Sometimes you need to cancel an order after placing it. Here's how you can do that on YouBuy.

## Cancellation Window

You can only cancel an order if it hasn't been shipped yet. Once the seller marks the order as shipped, you'll need to contact them directly about return options.

## Steps to Cancel an Order

1. Log in to your YouBuy account
2. Navigate to "Purchases" in your profile
3. Find the order you want to cancel
4. Click on "View Details"
5. If the order is still cancelable, you'll see a "Cancel Order" button
6. Click the button and confirm your cancellation

## What Happens After Cancellation

After you cancel an order:

- You'll receive a confirmation email
- The funds will be refunded to your original payment method
- Refunds typically take 3-5 business days to appear in your account

## If You Can't Cancel

If you don't see the "Cancel Order" button, it means the order has progressed too far in the fulfillment process. In this case:

1. Message the seller immediately
2. Explain your situation and request a cancellation
3. The seller may still be able to cancel if they haven't shipped the item

Remember that each seller has their own cancellation policy, so outcomes may vary.
    `,
    createdAt: new Date('2023-05-20'),
    updatedAt: new Date('2023-06-18'),
    viewCount: 983,
    published: true
  },
  {
    id: "return-item",
    title: "How to return an item",
    category: "orders",
    content: `
# Returning an Item

If you're not satisfied with your purchase, you can return it following these steps.

## Return Eligibility

Before starting a return, check if your item is eligible:

- Returns must typically be initiated within 14 days of delivery
- The item should be in its original condition
- Some items may be marked as non-returnable by the seller

## Starting a Return

1. Log in to your YouBuy account
2. Go to "Purchases" in your profile
3. Find the order with the item you want to return
4. Click "View Details"
5. Select "Return Item"
6. Choose the reason for your return
7. Follow the instructions to complete the return request

## Return Shipping

Depending on the reason for return:

- If the item is defective or not as described, the seller typically covers return shipping
- If you're returning for other reasons (wrong size, changed mind), you may need to pay for return shipping

## Refund Process

After the seller receives and inspects the returned item:

1. They'll approve or reject your refund
2. If approved, the refund will be processed to your original payment method
3. Most refunds take 5-10 business days to appear in your account

## Return Disputes

If you have any issues with your return or refund:

1. First, message the seller to try to resolve the issue
2. If that doesn't work, you can open a dispute through YouBuy's resolution center
    `,
    createdAt: new Date('2023-06-02'),
    updatedAt: new Date('2023-08-10'),
    viewCount: 1542,
    published: true
  },
  {
    id: "shipping-options",
    title: "Available shipping methods",
    category: "shipping",
    content: `
# Shipping Methods on YouBuy

YouBuy offers several shipping options to meet your needs.

## In-Person Pickup

Many sellers offer in-person pickup, which allows you to:

- Arrange a meeting place with the seller
- Inspect the item before purchase
- Avoid shipping costs
- Get your item immediately

## Standard Shipping

Standard shipping is the most common option:

- Typically delivered within 3-7 business days
- Tracking information is usually provided
- Cost varies by seller, item weight, and distance

## Express Shipping

For faster delivery, some sellers offer express shipping:

- Delivery within 1-3 business days
- Higher cost than standard shipping
- Not available for all items or locations

## International Shipping

For cross-border purchases:

- Longer delivery times (typically 1-3 weeks)
- May incur customs duties and import taxes
- Requires more detailed address information
- Not offered by all sellers

## Free Shipping

Some sellers offer free shipping:

- Usually available for orders above a certain amount
- May be limited to standard shipping only
- Could be restricted to certain geographical areas

Always check the product listing for available shipping options before making your purchase.
    `,
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-05-30'),
    viewCount: 876,
    published: true
  },
  {
    id: "payment-methods",
    title: "Accepted payment methods",
    category: "payments",
    content: `
# Payment Methods Accepted on YouBuy

YouBuy supports various payment methods to make your shopping experience convenient and secure.

## Credit and Debit Cards

We accept all major cards:

- Visa
- Mastercard
- American Express
- Discover

Your card information is securely processed and never stored on our servers.

## Digital Wallets

For faster checkout, we support:

- Apple Pay
- Google Pay
- PayPal

These options allow you to pay without entering your card details for each purchase.

## YouBuy Wallet

The YouBuy Wallet lets you:

- Store funds for future purchases
- Receive refunds more quickly
- Pay instantly without entering payment details
- Take advantage of special wallet-only promotions

To add funds to your wallet, go to your Profile > Wallet.

## Installment Plans

For eligible purchases over $100, we offer installment payment options through:

- Klarna
- Afterpay
- Affirm

These services let you split your payment into smaller amounts over time.

## Payment Security

All payments on YouBuy are secured with:

- SSL encryption
- 3D Secure authentication
- Fraud detection systems
- Buyer protection policies

Your financial security is our priority.

## Currency

All transactions on YouBuy are processed in USD.
    `,
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2023-09-05'),
    viewCount: 2187,
    published: true
  },
  {
    id: "change-password",
    title: "How to change your password",
    category: "account",
    content: `
# Changing Your Password

Keeping your account secure is important. Here's how to change your password on YouBuy.

## Regular Password Change

To change your password when you remember your current password:

1. Log in to your YouBuy account
2. Go to Profile > Settings
3. Select the "Security" tab
4. Click "Change Password"
5. Enter your current password
6. Enter your new password twice
7. Click "Save Changes"

## Password Requirements

Your new password must:

- Be at least 8 characters long
- Include at least one uppercase letter
- Include at least one number
- Include at least one special character
- Not be the same as your previous password

## Forgotten Password

If you've forgotten your password:

1. Click "Forgot Password" on the login screen
2. Enter the email address associated with your account
3. Check your email for a password reset link
4. Click the link and follow the instructions to create a new password

The reset link is valid for 24 hours.

## After Changing Your Password

After successfully changing your password:

- You'll receive a confirmation email
- All other devices will be signed out
- You'll need to sign in again with your new password

## Security Tips

For better account security:

- Change your password regularly
- Don't reuse passwords from other websites
- Consider using a password manager
- Enable two-factor authentication in your account settings
    `,
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-04-15'),
    viewCount: 1345,
    published: true
  },
  {
    id: "how-youbuy-works",
    title: "How YouBuy works",
    category: "general",
    content: `
# How YouBuy Works

YouBuy is a peer-to-peer marketplace that connects buyers and sellers. Here's how it all works.

## For Buyers

### Finding Products

- Browse categories on the homepage
- Use the search bar to find specific items
- Filter results by price, location, and more
- Save favorites for later

### Making Purchases

1. Select an item you're interested in
2. Review the product details, photos, and seller information
3. Choose "Buy Now" or message the seller with questions
4. Select your preferred payment and shipping options
5. Complete the checkout process

### After Purchase

- Track your order in the "Purchases" section
- Contact the seller directly through our messaging system
- Leave a review once you receive your item

## For Sellers

### Listing Items

1. Click "Sell" on the navigation bar
2. Upload photos and provide detailed information about your item
3. Set your price and shipping options
4. Publish your listing

### Managing Sales

- Receive notifications when someone purchases your item
- Communicate with buyers through our messaging system
- Ship items promptly and provide tracking information
- Receive payment once the buyer confirms receipt

## YouBuy Protection

We protect both buyers and sellers:

- Secure payment processing
- Dispute resolution for transaction issues
- Anti-fraud measures
- Community ratings and reviews

## Fees

- Buying is free
- Sellers pay a 5% commission on completed sales
- YouBuy Premium members pay reduced fees of 3%

## Community Guidelines

All users agree to follow our community guidelines, which promote:

- Honest descriptions and fair pricing
- Respectful communication
- Prompt responses and shipping
- Following local laws and regulations

Join thousands of users buying and selling on YouBuy today!
    `,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-10-01'),
    viewCount: 5432,
    published: true
  },
  {
    id: "premium-benefits",
    title: "YouBuy Premium benefits",
    category: "premium",
    content: `
# YouBuy Premium Benefits

Upgrade to YouBuy Premium and enjoy these exclusive benefits.

## Reduced Fees

- **Standard seller fee**: 5%
- **Premium seller fee**: 3%

These savings can add up quickly if you're a regular seller!

## Enhanced Visibility

- Featured placement in search results
- "Premium Seller" badge on your listings and profile
- Priority in category browsing pages

## Advanced Analytics

- Detailed visitor analytics for your listings
- Conversion rate tracking
- Performance comparison with similar listings
- Market trend insights

## Promotional Tools

- Ability to run limited-time promotions
- Discount code creation
- Bundle deal options
- Featured item rotation

## Customer Support

- Priority customer service
- Dedicated support line
- Faster response times
- Advanced dispute resolution

## Shipping Benefits

- Discounted shipping rates
- Enhanced shipping insurance
- Premium packaging options
- International shipping tools

## Subscription Options

- Monthly: $9.99/month
- Annual: $99/year (save over 17%)

## How to Subscribe

1. Go to Profile > Premium
2. Choose your subscription plan
3. Enter your payment information
4. Start enjoying Premium benefits immediately

## Cancellation

You can cancel your Premium subscription at any time:

1. Go to Profile > Premium > Subscription Settings
2. Select "Cancel Subscription"
3. Confirm your cancellation

Your Premium benefits will continue until the end of your current billing period.

Upgrade today and take your YouBuy experience to the next level!
    `,
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-09-15'),
    viewCount: 2876,
    published: true
  },
  {
    id: "wrong-item-received",
    title: "What to do if you received the wrong item",
    category: "orders",
    content: `
# What to Do If You Received the Wrong Item

If you received an item that doesn't match what you ordered, follow these steps to resolve the situation.

## Verify the Order

First, double-check your order details:

1. Go to your "Purchases" section
2. Find the order in question
3. Review the product description, photos, and specifications
4. Confirm that what you received is indeed different from what was advertised

## Contact the Seller

Reach out to the seller directly:

1. Open the order details
2. Click "Message Seller"
3. Explain the situation clearly
4. Include photos comparing what you received to the listing
5. Ask for a resolution (replacement, refund, etc.)

Many issues can be resolved directly with the seller.

## Allow Response Time

Give the seller 48 hours to respond. Most sellers want to maintain good ratings and will work to resolve the issue.

## Open a Dispute

If the seller doesn't respond or refuses to help:

1. Go to the order details
2. Click "Open Dispute"
3. Select "Wrong item received" as the reason
4. Upload photos as evidence
5. Describe what happened and your preferred resolution

## Resolution Process

Once a dispute is opened:

1. The seller has 72 hours to respond
2. If they don't respond, the case will typically be decided in your favor
3. If they do respond, YouBuy's support team will review the evidence
4. A decision will be made within 5-7 business days

## After Resolution

If your dispute is successful:

- You'll receive a refund to your original payment method
- You may be asked to return the wrong item (with a prepaid shipping label)
- The seller's account will be flagged for review

We're committed to ensuring you get exactly what you order on YouBuy!
    `,
    createdAt: new Date('2023-07-18'),
    updatedAt: new Date('2023-07-18'),
    viewCount: 567,
    published: true
  }
];
