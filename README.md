Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Wallet System

This project includes a complete wallet system that allows users to manage funds and make payments. The wallet system provides the following features:

### Features

- **Wallet Management**: Users can view their balance, add funds, and withdraw money
- **Transaction History**: All transactions (deposits, withdrawals, payments) are recorded and displayed
- **Payment Integration**: Users can pay for orders directly from their wallet during checkout
- **Secure Transactions**: All wallet operations are secured with proper authorization and validation

### Database Structure

The wallet system uses the following tables:

1. **wallets**: Stores user wallet information
   - `id`: Serial primary key
   - `user_id`: Reference to auth.users
   - `balance`: Current balance (DECIMAL)
   - `created_at`, `updated_at`: Timestamps

2. **wallet_transactions**: Records all wallet operations
   - `id`: Serial primary key
   - `user_id`: Reference to auth.users
   - `type`: Transaction type (deposit, withdrawal, payment)
   - `amount`: Transaction amount (DECIMAL)
   - `description`: Transaction description
   - `created_at`: Timestamp

### Database Functions

The system includes the following PostgreSQL functions:

- **make_deposit(user_id, amount, description)**: Adds funds to a wallet
- **make_withdrawal(user_id, amount, description)**: Withdraws funds from a wallet
- **make_payment(user_id, amount, description)**: Processes a payment from a wallet

### Setup Instructions

To set up the wallet system, run the SQL migration:

```bash
# Using Supabase CLI
supabase db reset

# Or manually run the migration in the SQL Editor:
# Run the contents of supabase/migrations/wallet_tables.sql
```

### Implementation Details

- **WalletContext.tsx**: Provides wallet functionality to the entire application
- **WalletPage.tsx**: User interface for managing wallet balance and viewing transactions
- **PaymentForm.tsx**: Updated to include wallet payment option during checkout

### Usage in Checkout Flow

During checkout, users can now choose between:
- **Wallet Payment**: Pay directly using wallet balance
- **Cash on Delivery**: Traditional payment method

The wallet payment option will only be enabled if the user has sufficient funds.

## ShipDay Delivery Integration

This project includes integration with ShipDay for delivery tracking and management. The `scripts/create-test-order.js` script demonstrates how to create orders in our database and send them to ShipDay.

### Setup Instructions

#### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key

# For ShipDay integration (optional)
SHIPDAY_API_KEY=your_shipday_api_key
SHIPDAY_API_URL=https://api.shipday.com
```

**Important Notes about ShipDay:**
- The SHIPDAY_API_KEY should be obtained from your ShipDay account dashboard
- The SHIPDAY_API_URL should be exactly `https://api.shipday.com` (without `/v1`)
- Make sure your ShipDay account is active and has API access enabled

#### Usage

To create a test order and send it to ShipDay:

```bash
node scripts/create-test-order.js
```

The script will:
1. Create an order in your database
2. Create a delivery route linked to the order
3. Create a status history entry for the order
4. Format and send the order to ShipDay
5. Update the order with the ShipDay order ID upon success

### ShipDay Integration Details

The integration uses ShipDay's API to create delivery orders with the following information:

- Customer details (name, address, phone, email)
- Pickup details (address, coordinates, contact info)
- Delivery details (address, coordinates, instructions)
- Order information (amount, delivery fee, items)
- Delivery scheduling (date, time window)

Authentication with ShipDay requires:
- HTTP Basic authentication format: `Authorization: Basic YOUR_API_KEY`
- The correct endpoint URL: `https://api.shipday.com/orders`

### Troubleshooting

If you encounter issues with the ShipDay integration:

1. **403 Forbidden errors**: Check your API key and ensure it's formatted correctly with the `Basic` prefix
2. **404 Not Found errors**: Ensure you're using the correct endpoint URL without the `/v1` prefix
3. **400 Bad Request errors**: Check the request payload format against ShipDay's documentation
4. **Missing environment variables**: The script will warn you if ShipDay-related environment variables are missing

The script is designed to create orders in your database even if ShipDay integration fails, so your core functionality will still work.

For more information about ShipDay's API, refer to their [official documentation](https://docs.shipday.com/reference/authentication).
