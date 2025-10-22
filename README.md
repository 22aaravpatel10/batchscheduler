# Batch Scheduler MVP

A simple, user-friendly platform for batch scheduling, equipment tracking, and automatic inventory updates, tailored for chemical/process manufacturing plants.

## Features

### Core Features
- **Equipment Scheduler**: Google Calendar-style interface with Timeline and Calendar views to create, view, edit, and manage batch schedules
- **Batch Management**: Create, edit, and delete batches with full material assignment and equipment tracking
- **Batch Status Tracking**: Track batches with status (Planned, In Progress, Completed, Delayed, On Hold, Cancelled)
- **Inventory Management**: Automatic inventory updates when batches are scheduled with low stock alerts
- **Dashboard View**: Overview of upcoming batches, late batches, and low inventory alerts
- **Data Persistence**: PostgreSQL database for reliable data storage
- **Enhanced UI/UX**: Centered modal forms with split-view sidebars, persistent notifications, and improved navigation

### Advanced Features
- **GxP Compliance**: FDA 21 CFR Part 11 compliance with audit trails and electronic signatures
- **Material Safety**: OSHA HazCom & GHS compliance with SDS management, hazard classifications, and PPE requirements
- **DCS Integration**: Connect with Distributed Control Systems via webhooks for real-time equipment data
- **Audit Trail**: Complete change tracking for batches, materials, and equipment
- **Quality Control**: Material QC status tracking and approval workflows

### Technology Stack
- **Frontend**: Next.js 15.5.6 (React) with TypeScript and Turbopack
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Firebase Authentication (ready for implementation)
- **Calendar**: react-big-calendar with multiple view modes (Month/Week/Day/Agenda)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast with persistent notifications

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Firebase project (optional, for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd batchscheduler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and configure:

   **Database Configuration (Required)**:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/batchscheduler?schema=public"
   ```

   **Firebase Configuration (Optional for MVP)**:
   - Create a Firebase project at https://console.firebase.google.com
   - Go to Project Settings > General
   - Copy your Firebase configuration values
   - Update the Firebase variables in `.env.local`

4. **Set up the database**

   The Prisma schema is already configured. To create your database:

   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations to create tables
   npx prisma migrate dev --name init
   ```

   To view your database in a GUI:
   ```bash
   npx prisma studio
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### 1. Adding Equipment

1. Navigate to the **Equipment** page
2. Click **Add Equipment**
3. Enter equipment name (e.g., "Glass Liner 8kl Reactor")
4. Add description (e.g., "Abrasion resistant, jacketed, glass-lined reactor")
5. Click **Create**

### 2. Managing Inventory

1. Navigate to the **Inventory** page
2. Click **Add Material**
3. Fill in the form:
   - **Name**: Material name (e.g., "Hydrogen Peroxide")
   - **Description**: Optional details (e.g., "30% solution")
   - **Unit**: Unit of measurement (e.g., "kg", "L")
   - **Current Quantity**: Available stock
   - **Minimum Quantity**: Alert threshold
4. Click **Create**

Materials below minimum quantity will show up in the dashboard as low inventory alerts.

### 3. Scheduling and Managing Batches

1. Navigate to the **Scheduler** page
2. Choose your preferred view:
   - **Timeline View**: Horizontal timeline showing equipment utilization across time
   - **Calendar View**: Traditional calendar with multiple modes:
     - Month view
     - Week view
     - Day view
     - Agenda view
3. **Creating a batch**:
   - Click **Create Batch** button
   - Fill in all required fields (batch name, equipment, start/end times)
   - Optionally add materials and quantities
   - Click **Create Batch**
4. **Viewing batch details**:
   - Click on any batch in the scheduler
   - View comprehensive information including equipment, materials, status, and notes
5. **Editing a batch**:
   - Click on a batch to open details
   - Click **Edit Batch** button
   - Modify any information
   - Click **Update Batch** to save changes
6. Batches are color-coded by status:
   - **Teal**: Planned
   - **Amber**: In Progress
   - **Emerald**: Completed
   - **Rose**: Delayed
   - **Slate**: On Hold
   - **Gray**: Cancelled

### 4. Dashboard Overview

The dashboard provides:
- Total equipment count
- Batches in progress
- Late batches requiring attention
- Low inventory alerts
- Upcoming batches (next 7 days)

## Database Schema

### Equipment
- Stores manufacturing equipment/reactors
- Related to batches via one-to-many relationship

### Batch
- Represents scheduled batch operations
- Tracks status, timing, and equipment assignment
- Linked to materials through BatchMaterial junction table

### Material
- Inventory items (chemicals, raw materials)
- Tracks current and minimum quantities
- Auto-updates when assigned to batches

### BatchMaterial
- Junction table linking batches to materials
- Tracks quantity consumed per batch

### User
- Stores user authentication data
- Ready for Firebase integration

## API Endpoints

### Equipment
- `GET /api/equipment` - List all equipment
- `POST /api/equipment` - Create equipment
- `GET /api/equipment/[id]` - Get single equipment
- `PUT /api/equipment/[id]` - Update equipment
- `DELETE /api/equipment/[id]` - Delete equipment

### Batches
- `GET /api/batches` - List all batches (with filters)
- `POST /api/batches` - Create batch (auto-updates inventory)
- `GET /api/batches/[id]` - Get single batch
- `PUT /api/batches/[id]` - Update batch
- `DELETE /api/batches/[id]` - Delete batch (restores inventory)

### Materials
- `GET /api/materials` - List all materials
- `POST /api/materials` - Create material
- `GET /api/materials/[id]` - Get single material
- `PUT /api/materials/[id]` - Update material
- `DELETE /api/materials/[id]` - Delete material

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics and alerts

## Development

### Running Prisma Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration-name>

# View database in browser
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Building for Production

```bash
npm run build
npm start
```

## Environment Variables Reference

### Required
- `DATABASE_URL`: PostgreSQL connection string

### Optional (Firebase Authentication)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Optional (AWS S3 - Not Active in MVP)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`

## Current Features (Implemented)

✅ **Batch Scheduling**
- Create, edit, and delete batches with full functionality
- Calendar and Timeline views
- Multiple calendar modes (Month/Week/Day/Agenda)
- Color-coded status tracking
- Material assignment with automatic inventory updates
- Batch editing from detail modal

✅ **Equipment Management**
- Full CRUD operations for equipment
- Detailed equipment specifications (ID, size, manufacturer, material of construction)
- Equipment utilization in timeline view
- Centered modal forms with split-view sidebar showing all added equipment

✅ **Inventory Management**
- Material CRUD operations
- Automatic inventory updates when batches are created/edited/deleted
- Low stock alerts and warnings
- Centered modal forms with split-view sidebar showing all added materials

✅ **Dashboard**
- Real-time statistics (equipment count, batches in progress, late batches)
- Low inventory warnings
- Upcoming batches view (next 7 days)

✅ **GxP Compliance Framework**
- Audit trail system for change tracking
- FDA 21 CFR Part 211 material tracking fields
- OSHA HazCom & GHS compliance fields
- GxP Configuration page (accessible via Settings dropdown)

✅ **DCS Integration**
- Integration management interface
- Webhook configuration
- Connection testing capabilities

✅ **Enhanced UI/UX**
- Persistent notifications with dismiss buttons (duration: Infinity)
- Split-view modal design with equipment/material sidebars
- Settings dropdown navigation in top-right corner
- Improved form layouts with proper scrolling support
- Custom notification icons for different actions

## Planned Enhancements

### Near-term
- User authentication with Firebase
- Role-based access control
- Drag-and-drop batch scheduling in calendar
- Real-time notifications via WebSockets
- Batch templates for common operations

### Long-term
- Export reports (PDF, CSV)
- Email notifications for low inventory and late batches
- Advanced mobile-responsive improvements
- Batch history and analytics dashboard
- SDS document upload and management
- Electronic signature workflow for GxP compliance
- Batch genealogy tracking
- Process validation documentation generation

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env.local`
- Check database credentials and permissions

### Prisma Client Errors
```bash
# Regenerate Prisma Client
npx prisma generate
```

### Port Already in Use
```bash
# Change port in package.json or kill existing process
npx kill-port 3000
```

## License

MIT

## Support

For issues, questions, or contributions, please open an issue in the repository.
