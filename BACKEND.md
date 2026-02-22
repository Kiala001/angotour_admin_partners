# AngoTour Admin Partners - Backend Documentation

## Overview

The backend uses a **JSON-based repository** instead of PostgreSQL for data persistence. All data is stored in a single JSON file (`data/db.json`) that is automatically created and managed by the application.

## Architecture

### Data Layer (`lib/db/`)

#### `repository.ts`
Core data access layer that handles all CRUD operations:
- Reads/writes to `data/db.json`
- Automatic directory creation
- Async/await based operations
- Unique ID generation with timestamps

**Key Functions:**
- `loadState()` - Reads entire database state
- `saveState(state)` - Persists state to JSON file
- Partner operations: `addPartner`, `updatePartner`, `getPartner`, `getAllPartners`, `blockPartner`
- Document operations: `addDocument`, `reviewDocument`
- Plan operations: `addPlan`, `updatePlan`, `deletePlan`, `getAllPlans`
- Subscription operations: `addSubscription`, `reviewSubscription`, `getAllSubscriptions`
- Payment method operations: `addPaymentMethod`, `updatePaymentMethod`, `deletePaymentMethod`, `getAllPaymentMethods`
- Service operations: `addService`, `updateService`, `deleteService`, `getServicesByPartner`
- Log operations: `addLog`, `getLogs`
- Admin operations: `getAdminByEmail`, `getAllAdmins`

#### `seed.ts`
Database initialization with default data:
- Initial plans (Starter, Professional, Premium)
- Payment methods (Bank Transfer, Credit Card)
- Admin user (`admin@angotour.com` / `admin123`)

### API Routes (`app/api/`)

All API routes follow REST conventions:

#### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/partner/register` - Partner registration
- `POST /api/auth/partner/login` - Partner login

#### Partners
- `GET /api/partners` - Get all partners or specific partner by ID
- `POST /api/partners` - Create new partner
- `PUT /api/partners` - Update partner
- `POST /api/partners/[id]/block` - Block/unblock partner

#### Documents
- `POST /api/documents` - Upload or review documents

#### Plans
- `GET /api/plans` - Get all plans
- `POST /api/plans` - Create plan
- `PUT /api/plans` - Update plan
- `DELETE /api/plans` - Delete plan

#### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `POST /api/subscriptions` - Create or review subscription

#### Payment Methods
- `GET /api/payment-methods` - Get all payment methods
- `POST /api/payment-methods` - Create payment method
- `PUT /api/payment-methods` - Update payment method
- `DELETE /api/payment-methods` - Delete payment method

#### Services
- `GET /api/services` - Get services by partner ID
- `POST /api/services` - Create service
- `PUT /api/services` - Update service
- `DELETE /api/services` - Delete service

#### Logs
- `GET /api/logs` - Get activity logs with optional limit

### Client Layer (`lib/`)

#### `api-client.ts`
Typed API client with methods for all endpoints:
- `useApi<T>()` hook for component-level fetching
- `apiCall()` function for direct API calls
- `apiClient` object with methods for all operations

**Example Usage:**
```typescript
// In a component
const { data, isLoading, error, refetch } = useApi<Partner[]>("/partners")

// Direct API call
const partners = await apiClient.getPartners()
const newPartner = await apiClient.createPartner(partnerData)
```

## Data Flow

### Request Flow
1. Frontend component calls `apiClient.method()`
2. `apiClient` makes HTTP request to `/api/endpoint`
3. API route handler processes request
4. Repository function performs CRUD operation
5. `loadState()` reads current `data/db.json`
6. Operation is applied to state
7. `saveState()` writes updated state back to file
8. API route returns response

### Data Storage

**File Location:** `data/db.json`

**Structure:**
```json
{
  "partners": [],
  "plans": [],
  "subscriptions": [],
  "paymentMethods": [],
  "services": [],
  "admins": [],
  "logs": []
}
```

## Getting Started

### 1. Initialize Database
The database is automatically created on first API call. To manually initialize:

```typescript
import { initializeDatabase } from "@/lib/db/seed"

await initializeDatabase()
```

### 2. Using the API Client
```typescript
"use client"
import { apiClient } from "@/lib/api-client"

// Create partner
const partner = await apiClient.createPartner({
  type: "Hotel",
  companyName: "My Hotel",
  nif: "1234567890",
  email: "contact@hotel.com",
  loginEmail: "admin@hotel.com",
  password: "password123",
  phone: "+244912345678",
  province: "Luanda",
  city: "Luanda",
  bairro: "Maianga",
  rua: "Rua Principal"
})
```

### 3. Fetching Data in Components
```typescript
"use client"
import { useApi } from "@/lib/api-client"
import type { Partner } from "@/lib/types"

export function PartnersList() {
  const { data: partners, isLoading } = useApi<Partner[]>("/partners")
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <ul>
      {partners?.map(p => <li key={p.id}>{p.companyName}</li>)}
    </ul>
  )
}
```

## Default Data

### Admin Account
- Email: `admin@angotour.com`
- Password: `admin123`

### Plans
1. **Plano Iniciante** - 30 days, 5,000 AOA
2. **Plano Profissional** - 90 days, 15,000 AOA
3. **Plano Premium** - 365 days, 50,000 AOA

### Payment Methods
1. Bank Transfer (IBAN provided)
2. Credit Card (Visa, Mastercard, Amex)

## Important Notes

### File-Based Storage Characteristics
- ✅ Perfect for small to medium projects
- ✅ No external database required
- ✅ Easy to backup and version control
- ⚠️ Not suitable for high-concurrency environments
- ⚠️ No built-in transaction support
- ⚠️ File locking considerations for simultaneous writes

### Security Notes
- **Development Only:** Passwords are stored in plain text for demo purposes
- **Production:** Implement bcrypt for password hashing
- **Authentication:** Use JWT tokens instead of storing passwords in session
- **Validation:** Implement input validation on all endpoints

## Migrating to PostgreSQL

To migrate to PostgreSQL in the future:

1. Create similar repository functions using a PostgreSQL client (pg, prisma, etc.)
2. Replace imports in API routes from `@/lib/db/repository` to new DB module
3. No changes needed in API route handlers or client code

## File Structure

```
/
├── app/api/
│   ├── auth/
│   │   ├── admin/login/route.ts
│   │   └── partner/
│   │       ├── login/route.ts
│   │       └── register/route.ts
│   ├── documents/route.ts
│   ├── logs/route.ts
│   ├── partners/
│   │   ├── [id]/block/route.ts
│   │   └── route.ts
│   ├── payment-methods/route.ts
│   ├── plans/route.ts
│   ├── services/route.ts
│   └── subscriptions/route.ts
├── lib/
│   ├── api-client.ts
│   └── db/
│       ├── repository.ts
│       └── seed.ts
└── data/
    └── db.json (auto-generated)
```

## Debugging

Enable debug logging in API routes to track operations:

```typescript
console.log("[v0] Operation performed:", operationName)
```

Check `data/db.json` directly to inspect current state.

## Performance Considerations

- For projects with <10,000 partners: JSON storage is perfectly adequate
- Read operations are O(n) - use indexing strategies if needed
- Write operations block briefly - acceptable for most use cases
- Consider pagination for large datasets

## Future Enhancements

- [ ] Add database transaction support
- [ ] Implement data validation middleware
- [ ] Add rate limiting
- [ ] Implement proper authentication with JWT
- [ ] Add data encryption at rest
- [ ] Migrate to PostgreSQL for production
