# Nectar Ingredients — Admin Role Setup & Operations

To configure administrative access and manage customer orders in the new direct checkout system, complete these setup queries in your database.

---

## 1. Setting up an Admin User Account

Supabase Auth stores metadata for users. The `/admin` portal reads the user session metadata check `user.user_metadata.is_admin === true` to determine access.

### SQL Query to Assign Admin Access
Open your **Supabase Dashboard ➔ SQL Editor ➔ New Query**, paste the following, replace with your authorized Google Email, and hit **Run**:

```sql
-- Update metadata to make the specified user email a system administrator
UPDATE auth.users
SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
WHERE email = 'your-google-email@example.com';
```

*Note: You must sign in to the website using Google OAuth at least once first, so that your record exists in the `auth.users` table.*

### SQL Query to Remove Admin Access
If you ever need to revoke access, run:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'is_admin'
WHERE email = 'your-google-email@example.com';
```

---

## 2. Price List Sync Configuration (Google Sheet & Vercel)

The sync flow requires two separate configuration entries:
- **`PRICE_SYNC_URL`**: The web address where Google Sheets sends updates.
- **`PRICE_SYNC_SECRET`**: The secret password used to authenticate the request.

### Google Sheets Side (Apps Script)
Open your spreadsheet's Apps Script editor and define both variables at the top of the file:

```javascript
// The destination URL on your website
const SYNC_URL = 'https://nectaringredients.vercel.app/api/sync-price';

// The secret token to authenticate the sheet (keep this secret)
const SYNC_SECRET = 'your-chosen-PRICE_SYNC_SECRET-value-here';
```

### Vercel / Website Side (.env.local)
Configure **only** the secret token as an environment variable in Vercel or your local `.env.local` file:

```bash
PRICE_SYNC_SECRET=your-chosen-PRICE_SYNC_SECRET-value-here
```
*(The website receives incoming requests on the `/api/sync-price` route, so it does not need a URL configuration variable on its side; it only needs the secret key to verify incoming pushes).*

---

## 3. Order Database Operations (For Reference)

Here are the useful SQL commands for manual database management if required:

### Manual Order Dispatch
The `/admin` panel allows dispatching orders with a single click. If you need to manually dispatch an order from the DB:

```sql
UPDATE public.orders
SET status = 'dispatched'
WHERE id = 'paste-uuid-here';
```

### Resetting Order to Pending Payment (For Payment Retries)
If a customer has a failed order and wants to retry payment manually:

```sql
UPDATE public.orders
SET status = 'pending_payment'
WHERE id = 'paste-uuid-here';
```
