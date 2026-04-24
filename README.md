# Service Booking Platform — Microservices (Django)

Each service follows the strict layered architecture:

```
service/
├── config/     Settings, URLs, WSGI/ASGI — Django wiring only
├── handler/    Request routing & validation — calls service layer
├── service/    Business logic — no DB calls, no HTTP calls
├── dao/        DB queries, Kafka publish, HTTP calls to other services
└── utils/      Auth decode, permissions, helpers, exception handler
```

---

## Services & Ports

| Service               | Port | Database         | Description                        |
|-----------------------|------|------------------|------------------------------------|
| api-gateway           | 8000 | —                | Single entry point, proxies all    |
| user-service          | 8001 | postgres-users   | Auth, profiles, addresses          |
| catalog-service       | 8002 | postgres-catalog | Categories & services              |
| booking-service       | 8003 | postgres-booking | Provider services, slots, bookings |
| payment-service       | 8004 | postgres-payment | Razorpay transactions              |
| notification-service  | 8005 | postgres-notif   | Email via Kafka consumer           |
| review-service        | 8006 | postgres-review  | Ratings & reviews                  |
| search-service        | 8007 | Elasticsearch    | Full-text provider search          |
| chat-service          | 8008 | postgres-chat    | WebSocket real-time chat           |

---

## Infrastructure

| Component     | Port  | Used by                              |
|---------------|-------|--------------------------------------|
| PostgreSQL ×7 | 5433–5439 | One dedicated DB per service     |
| Redis         | 6379  | Chat WebSocket layer                 |
| Kafka         | 9092  | Async events between services        |
| Elasticsearch | 9200  | Search service indexing              |

---

## Quick Start

```bash
# 1. Clone and enter the project
cd microservices

# 2. Copy and configure environment (edit each .env in each service folder)
#    At minimum set JWT_SECRET to the same value in all services

# 3. Start everything
docker-compose up --build

# 4. Create a superuser (user-service)
docker-compose exec user-service python manage.py createsuperuser
```

All APIs are available through the gateway at **http://localhost:8000**

---

## API Reference (all via gateway on port 8000)

### Auth
```
POST /api/auth/register/         Register seeker or provider
POST /api/auth/login/            Login → JWT tokens
POST /api/auth/refresh/          Refresh access token
POST /api/auth/logout/           Logout
POST /api/auth/change-password/  Change password
```

### Users
```
GET  /api/users/me/                         Your profile
PATCH /api/users/me/                        Update name
GET  /api/users/me/addresses/               List addresses
POST /api/users/me/addresses/               Add address
DEL  /api/users/me/addresses/<id>/          Delete address
POST /api/users/providers/<id>/approve/     Approve provider (admin)
```

### Catalog
```
GET  /api/catalog/categories/               List all categories
POST /api/catalog/categories/               Create category (admin)
GET  /api/catalog/services/                 List services
GET  /api/catalog/services/?category_id=X  Filter by category
POST /api/catalog/services/                 Create service (admin)
```

### Booking
```
GET  /api/booking/provider-services/        List provider services
POST /api/booking/provider-services/        Offer a service (provider)
GET  /api/booking/provider-services/mine/   Your offered services
POST /api/booking/availability/             Add time slot (provider)
GET  /api/booking/available-slots/          Check open slots
     ?provider_service_id=X&date=YYYY-MM-DD
POST /api/booking/                          Create booking (seeker)
GET  /api/booking/list/                     My bookings
GET  /api/booking/<id>/                     Booking detail
PATCH /api/booking/<id>/status/             Update status
```

### Payment
```
POST /api/payment/create-order/     Create Razorpay order (seeker)
POST /api/payment/verify/           Verify payment signature
POST /api/payment/refund/<id>/      Issue refund (admin)
GET  /api/payment/transactions/     My transactions
```

### Reviews
```
GET  /api/reviews/?target_id=X&target_type=provider   Reviews for a target
POST /api/reviews/                                     Submit review
```

### Search
```
GET  /api/search/
     ?q=plumbing&category=Plumbing&city=Pune
     &min_price=200&max_price=1000&min_rating=4
     &page=1&page_size=20
```

### Notifications
```
GET  /api/notifications/    My notifications
```

### Chat (WebSocket)
```
ws://localhost:8008/ws/chat/<booking_id>/?token=<access_token>

Send:    {"message": "Hello!"}
Receive: {"type": "message", "sender_name": "...", "content": "...", "created_at": "..."}
```

Chat REST (via gateway):
```
GET  /api/chat/<booking_id>/            Get chat history
POST /api/chat/<booking_id>/mark-read/  Mark messages as read
```

---

## How Services Communicate

```
                     ┌─────────────────┐
 Client ────────────▶│   api-gateway   │ :8000
                     └────────┬────────┘
                              │ HTTP proxy
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   user-service         booking-service     catalog-service
      :8001                 :8003               :8002
          │                   │
          │  internal HTTP     │  Kafka events
          └──────────────────▶│──────────────────▶ notification-service
                              │──────────────────▶ search-service
                              │
                         payment-service
                             :8004
                              │
                              └──────────────────▶ notification-service
```

**Rule:** Services never share a database. Cross-service reads use internal HTTP calls (`X-Internal-Token` header). Side effects (emails, search indexing) use Kafka events so the caller doesn't block.

---

## Layer Rules (strict)

| Layer     | Can call      | Cannot call        |
|-----------|---------------|--------------------|
| handler   | service       | dao, other services |
| service   | dao           | handler, requests  |
| dao       | DB, Kafka, HTTP | service, handler |
| utils     | nothing       | —                  |

---

## Booking Flow (end to end)

```
1.  Seeker registers          POST /api/auth/register/
2.  Seeker logs in            POST /api/auth/login/          → JWT token
3.  Browse categories         GET  /api/catalog/categories/
4.  Search providers          GET  /api/search/?q=plumbing&city=Pune
5.  Check available slots     GET  /api/booking/available-slots/
6.  Create booking            POST /api/booking/
                              → booking.created event → email sent
7.  Create payment order      POST /api/payment/create-order/
8.  Pay on Razorpay frontend
9.  Verify payment            POST /api/payment/verify/
                              → payment.success event → email sent
                              → booking status → confirmed
10. Provider confirms         PATCH /api/booking/<id>/status/ {status: in_progress}
11. Job done                  PATCH /api/booking/<id>/status/ {status: completed}
12. Seeker reviews provider   POST /api/reviews/
                              → avg_rating updated on provider profile
```
