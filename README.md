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
