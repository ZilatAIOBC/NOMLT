# Admin Dashboard Documentation

## Overview
The admin dashboard provides a comprehensive interface for monitoring and managing the NOLMT.AI platform.

## Folder Structure

```
frontend/src/
├── pages/Admin/
│   ├── AdminDashboard.tsx    # Main dashboard with metrics and charts
│   ├── AdminLayout.tsx        # Layout wrapper with sidebar
│   ├── UserManagement.tsx     # User management interface
│   ├── PlansAndPricing.tsx    # Subscription plans management
│   ├── Analytics.tsx          # Detailed analytics and insights
│   └── index.ts               # Export file for clean imports
│
└── components/admin/
    └── AdminSidebar.tsx       # Sidebar navigation component
```

## Routes

The admin dashboard is accessible via the following routes:

- `/admin/dashboard` - Main admin dashboard
- `/admin/users` - User management
- `/admin/plans` - Plans & pricing management
- `/admin/analytics` - Analytics and insights

## Features

### 1. Admin Dashboard (`/admin/dashboard`)
- **Metrics Cards:**
  - Total Users (12,847)
  - Active Subscriptions (3,247)
  - Total Credits Used (1.2M)
  - Revenue This Month ($23,456)
  - Active Features (8/10)
  - Avg Credits/User (94)

- **Top Used Features:**
  - Visual progress bars showing feature usage
  - Credits consumed per feature
  - Percentage breakdown

- **Most Active Users:**
  - Top performers list
  - User tier badges (Pro/Basic)
  - Credit usage statistics

### 2. User Management (`/admin/users`)
- User list with search and filter
- User details (name, email, tier, credits, status)
- Quick actions (email, ban, more options)
- Pagination support
- Status indicators (active, inactive, banned)

### 3. Plans & Pricing (`/admin/plans`)
- View all subscription plans
- Plan details (price, credits, features)
- Active users and revenue per plan
- Edit and delete plan options
- Add new plan functionality
- Revenue summary dashboard

### 4. Analytics (`/admin/analytics`)
- Time period selector (7, 30, 90 days, custom)
- Key metrics cards
- Feature usage breakdown
- Chart placeholders (ready for integration)
- Growth and revenue trends

## Sidebar Design

The sidebar follows the design shown in your reference image:
- Dark theme (`#0f1117` background)
- NOLMT logo with sparkle icon
- Active state highlighting (indigo-600)
- Navigation items:
  - Dashboard (LayoutDashboard icon)
  - User Management (Users icon)
  - Plans & Pricing (CreditCard icon)
  - Analytics (BarChart3 icon)
- Last updated timestamp in footer

## Accessing the Admin Dashboard

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:5173/admin/dashboard`

## Color Scheme

- Primary Background: `#13151f`
- Card Background: `#1a1d29`
- Sidebar Background: `#0f1117`
- Border Color: `#374151` (gray-800)
- Primary Accent: `#6366f1` (indigo-600)
- Text Primary: `#ffffff` (white)
- Text Secondary: `#9ca3af` (gray-400)

## Icons Used

- Lucide React icons:
  - `LayoutDashboard`, `Users`, `CreditCard`, `BarChart3`
  - `Sparkles`, `Zap`, `DollarSign`, `TrendingUp`
  - `Activity`, `Search`, `Filter`, `Edit2`, `Trash2`
  - `Mail`, `Ban`, `MoreVertical`, `Plus`, `CheckCircle`

## Next Steps

1. **Add Authentication:** Implement admin role checking before allowing access
2. **Connect to Backend:** Replace sample data with actual API calls
3. **Add Charts:** Integrate a charting library (e.g., Recharts, Chart.js) for the Analytics page
4. **Implement Actions:** Add functionality for edit, delete, and other action buttons
5. **Real-time Updates:** Add WebSocket or polling for live data updates
6. **Export Functionality:** Add CSV/PDF export for reports
7. **Advanced Filters:** Implement comprehensive filtering and sorting

## Sample Data

Currently, the admin dashboard uses sample data. You'll need to:
- Create admin API endpoints in the backend
- Implement data fetching services
- Add proper error handling and loading states
- Implement real-time data updates

## Security Considerations

⚠️ **Important:** Make sure to:
- Implement proper authentication
- Add role-based access control (RBAC)
- Protect admin routes with middleware
- Validate all admin actions on the backend
- Log all admin activities for audit purposes

