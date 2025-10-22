# Batch Scheduler MVP

A simple, user-friendly platform for batch scheduling, equipment tracking, and automatic inventory updates, tailored for chemical/process manufacturing plants.

## Features

### Core Features
- **Equipment Scheduler**: Google Calendar-style interface to create, view, and manage batch schedules
- **Batch Status Tracking**: Track batches with status (Planned, In Progress, Completed, Delayed, On Hold, Cancelled)
- **Inventory Management**: Automatic inventory updates when batches are scheduled
- **Dashboard View**: Overview of upcoming batches, late batches, and low inventory alerts
- **Data Persistence**: PostgreSQL database for reliable data storage

### Technology Stack
- **Frontend**: Next.js 14 (React) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Firebase Authentication (ready for implementation)
- **Calendar**: react-big-calendar for scheduler interface

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

### 3. Viewing the Scheduler

1. Navigate to the **Scheduler** page
2. View all batches in calendar format
3. Click on any batch to see details
4. Batches are color-coded by status:
   - **Blue**: Planned
   - **Yellow**: In Progress
   - **Green**: Completed
   - **Red**: Delayed
   - **Gray**: On Hold
   - **Slate**: Cancelled

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

## MVP Limitations & Future Enhancements

### Current MVP Limitations
1. **Batch Creation**: Currently view-only in scheduler. Batches can be created via API or future admin interface
2. **Authentication**: Firebase configured but login flow not yet implemented
3. **Drag & Drop**: Calendar is view-only; drag-and-drop batch creation planned for future
4. **Real-time Updates**: Manual refresh required to see changes
5. **User Roles**: Single-user mode; multi-user with permissions planned

### Planned Enhancements
- Drag-and-drop batch scheduling in calendar
- Real-time notifications for late batches
- Batch creation form with material assignment
- User authentication and authorization
- Export reports (PDF, CSV)
- Batch templates for common operations
- Email notifications for low inventory
- Mobile-responsive improvements
- Batch history and analytics

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
