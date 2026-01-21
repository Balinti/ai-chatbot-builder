# AI Chatbot Builder

A workflow-first Support Copilot demo for Shopify brands that turns support policies into safe, testable playbooks (WISMO, cancel-if-not-fulfilled, address change) with audit logs and Stripe subscriptions - usable instantly without signup.

## Features

- **Policy Builder**: Configure support policies for shipping/WISMO, cancellations, and address changes
- **Playground**: Test playbooks with sample tickets and order data
- **Audit Logs**: Track all simulation runs with confidence scores and citations
- **Cloud Sync**: Save progress to cloud when signed in
- **Stripe Billing**: Subscription management for premium features

## File Structure

```
ai-chatbot-builder/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Global layout with header
│   │   ├── page.tsx            # Landing page
│   │   ├── app/page.tsx        # Core app experience
│   │   ├── billing/page.tsx    # Stripe billing
│   │   ├── integrations/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── api/
│   │       ├── ai/route.ts     # AI playbook simulation
│   │       └── stripe/
│   │           ├── checkout/route.ts
│   │           ├── portal/route.ts
│   │           └── webhook/route.ts
│   ├── components/
│   │   ├── GoogleAuth.tsx      # Google OAuth with shared Supabase
│   │   ├── AuthProvider.tsx    # Auth context
│   │   ├── Header.tsx          # Navigation header
│   │   ├── PolicyBuilder.tsx   # Policy configuration
│   │   ├── Playground.tsx      # Ticket simulation
│   │   ├── LogsTable.tsx       # Audit logs display
│   │   └── SoftSavePrompt.tsx  # Save reminder
│   └── lib/
│       ├── supabaseAppClient.ts  # App DB client
│       ├── supabaseAdmin.ts      # Server admin client
│       ├── localState.ts         # localStorage management
│       ├── stripe.ts             # Stripe utilities
│       └── ai.ts                 # AI/fallback logic
└── supabase/
    ├── schema.sql              # Database tables
    └── rls.sql                 # Row Level Security
```

## Database Schema

### Tables

- **policy_versions**: User policy configurations
- **automation_events**: Playbook run logs
- **user_cloud_state**: Synced localStorage state
- **subscriptions**: Stripe subscription data

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/ai` | POST | Run playbook simulation |
| `/api/stripe/checkout` | POST | Create checkout session |
| `/api/stripe/portal` | POST | Open customer portal |
| `/api/stripe/webhook` | POST | Handle Stripe events |

## UI Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/app` | Core experience (policies + playground + logs) |
| `/billing` | Pricing and subscription management |
| `/integrations` | Shopify/Gorgias placeholders |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - App Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - App Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side service role key

### Optional
- `OPENAI_API_KEY` - For AI-powered responses (falls back to templates)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature
- `NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID` - Growth tier price ID
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` - Pro tier price ID
- `NEXT_PUBLIC_APP_URL` - App URL (defaults to localhost)

## Deployment

1. Clone the repository
2. Install dependencies: `npm install`
3. Set environment variables
4. Build: `npm run build`
5. Deploy to Vercel: `npx vercel --prod`
6. Run database migrations against your Supabase instance

## Services

### Active
- Supabase (authentication + database)
- Stripe (payments)
- OpenAI (optional, AI responses)

### Inactive (needs setup)
- `OPENAI_API_KEY`: AI-powered playbook responses
- `STRIPE_SECRET_KEY`: Subscription payments
- `NEXT_PUBLIC_STRIPE_*_PRICE_ID`: Upgrade buttons

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT
