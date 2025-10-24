# Database Migrations

This folder contains database migration files for the NOLMT.AI project.

## Files

- `database_migration.sql` - Complete database schema migration

## How to Run

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `database_migration.sql`
5. Click **Run** to execute the migration

### Using Supabase CLI

```bash
# Make sure you're logged in
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push migrations/database_migration.sql
```

### Using psql

```bash
# Set your database connection string
export DATABASE_URL="postgresql://user:password@host:port/database"

# Run the migration
psql $DATABASE_URL < migrations/database_migration.sql
```

## What This Migration Does

This migration creates:

1. **User Profiles** - Extended user profiles with roles and Stripe integration
2. **Plans & Subscriptions** - Subscription plans and user subscriptions
3. **Credits System** - Credits, transactions, and expirations
4. **AI Models** - AI model configurations
5. **Generations** - User generations tracking
6. **File Storage** - AWS S3 file storage tracking
7. **Payment Integration** - Stripe customers and transactions
8. **Admin Management** - Admin settings and API usage tracking
9. **Usage Summaries** - Pre-calculated usage statistics
10. **Notifications & Support** - User notifications and support tickets
11. **Analytics** - Daily statistics tracking

## Features

- ✅ Idempotent - Safe to run multiple times
- ✅ Complete schema - All tables, indexes, triggers, and policies
- ✅ Seed data - Includes default plans, AI models, and settings
- ✅ Row Level Security (RLS) - Proper security policies
- ✅ Performance optimized - Includes all necessary indexes

## Notes

- This migration uses `CREATE TABLE IF NOT EXISTS` and `ON CONFLICT DO NOTHING` to ensure it's safe to run multiple times
- All tables have proper foreign key constraints
- RLS policies are enabled on all tables
- Triggers are set up for automatic timestamp updates
- Seed data includes 4 subscription plans and 4 AI models

## Troubleshooting

If you encounter errors:

1. Check that you have the necessary PostgreSQL extensions enabled
2. Ensure you have proper permissions to create tables and functions
3. Verify that the Supabase auth schema exists
4. Check the Supabase logs for detailed error messages

## Support

For issues or questions, please contact the development team.

