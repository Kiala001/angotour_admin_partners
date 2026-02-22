## Backend Integration - Setup Guide

Your AngoTour Admin Partners app is now **fully connected to a JSON-based backend** with dynamic data fetching!

### Getting Started

**1. Initialize the database** (do this once):
```bash
curl http://localhost:3000/api/init
```

This creates the initial database with:
- 3 subscription plans (Free Trial, Basic, Professional)
- 2 payment methods (Depósito Bancário, Transferência)
- 1 default admin account

**2. Default credentials for testing:**

**Admin Login:**
- Email: `admin@angotour.com`
- Password: `admin123`

**Partner Test:**
- You can register a new partner at `/register`

### What Changed

All pages now use the **REST API** instead of localStorage:

#### Authentication (`/api/auth/`)
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/partner/login` - Partner login
- `POST /api/auth/partner/register` - Partner registration

#### Partners (`/api/partners/`)
- `GET /api/partners` - List all partners
- `GET /api/partners/:id` - Get single partner
- `POST /api/partners/:id/block` - Block/unblock partner

#### Plans (`/api/plans/`)
- `GET /api/plans` - List all plans
- `POST /api/plans` - Create plan
- `PATCH /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan

#### Subscriptions (`/api/subscriptions/`)
- `GET /api/subscriptions` - List all subscriptions
- `POST /api/subscriptions` - Create subscription
- `POST /api/subscriptions/:id/review` - Approve/reject subscription

#### Documents (`/api/documents/`)
- `GET /api/documents` - List all documents
- `POST /api/documents` - Upload document
- `POST /api/documents/:id/review` - Review/approve document

#### Services (`/api/services/`)
- `GET /api/services` - List services
- `POST /api/services` - Create service
- `PATCH /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

#### Payment Methods (`/api/payment-methods/`)
- `GET /api/payment-methods` - List payment methods
- `POST /api/payment-methods` - Create payment method
- `PATCH /api/payment-methods/:id` - Update payment method
- `DELETE /api/payment-methods/:id` - Delete payment method

#### Logs (`/api/logs/`)
- `GET /api/logs` - Get activity logs

### Updated Pages

**Fully Dynamic:**
- ✅ Login page (`/login`) - Uses API authentication
- ✅ Register page (`/register`) - Uses API registration
- ✅ Admin Partners (`/admin/partners`) - Fetches from API
- ✅ Partner Dashboard (`/partner/dashboard`) - Real-time data

**To be updated:**
- [ ] Admin Plans page
- [ ] Admin Subscriptions page
- [ ] Partner Services page
- [ ] Documents pages
- [ ] Payment Methods pages
- [ ] Other admin/partner pages

### Data Persistence

All data is stored in:
- **File**: `data/db.json` (on the server)
- **Location**: Persists across server restarts
- **Format**: Structured JSON with all entities

### Development Tips

1. **Check the database**: View `data/db.json` to see all stored data
2. **Debug API calls**: Check browser console for request/response logs
3. **Reset data**: Delete `data/db.json` and restart the server to reinitialize
4. **Add logging**: Use `console.log("[v0] ...")` in components to debug

### Migration Path

To upgrade from this JSON backend to PostgreSQL later:
- The API layer stays the same
- Only the `lib/db/repository.ts` needs updating
- All frontend code remains unchanged

### Need Help?

Check the `BACKEND.md` file for detailed API documentation.
