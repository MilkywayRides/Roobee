# Project Management System

A comprehensive project management system built with Next.js, ShadCN UI, and Prisma, featuring project categorization, GitHub integration, and admin controls.

## Features

### 🎯 Core Features
- **Project Categorization**: Free, Paid, and Premium projects
- **GitHub Integration**: Import projects directly from GitHub repositories
- **Admin Dashboard**: Complete project management interface
- **Search & Filtering**: Advanced search and category filtering
- **Responsive Design**: Mobile-first responsive UI with ShadCN components

### 📊 Project Management
- **CRUD Operations**: Create, read, update, and delete projects
- **Pricing System**: Coin-based pricing for paid/premium projects
- **File Management**: Upload and manage project files
- **Owner Management**: Track project ownership and permissions

### 🔧 Admin Features
- **Statistics Dashboard**: Project counts and analytics
- **Bulk Operations**: Manage multiple projects efficiently
- **GitHub Import**: Secure GitHub repository integration
- **User Management**: Control access and permissions

## Project Structure

```
app/
├── projects/
│   ├── page.tsx              # Project listing page
│   └── [id]/
│       └── page.tsx          # Project detail page
├── admin/
│   └── projects/
│       ├── page.tsx          # Admin projects dashboard
│       ├── create/
│       │   └── page.tsx      # Create new project
│       ├── edit/
│       │   └── [id]/
│       │       └── page.tsx  # Edit project
│       └── import/
│           └── page.tsx      # GitHub import
└── api/
    └── projects/
        ├── route.ts          # Main projects API
        └── [id]/
            └── route.ts      # Individual project API
```

## API Endpoints

### Projects API

#### GET /api/projects
Fetch all projects with optional filtering and pagination.

**Query Parameters:**
- `category`: Filter by category (free, paid, premium)
- `search`: Search in name and description
- `limit`: Number of projects to return
- `offset`: Number of projects to skip

**Response:**
```json
{
  "projects": [...],
  "totalCount": 50,
  "hasMore": true
}
```

#### POST /api/projects
Create a new project.

**Body:**
```json
{
  "name": "Project Name",
  "description": "Project description",
  "category": "free|paid|premium",
  "price": 100,
  "githubRepo": "https://github.com/user/repo",
  "ownerId": "user-id"
}
```

#### GET /api/projects/[id]
Fetch a specific project with owner and file information.

#### PUT /api/projects/[id]
Update a project.

#### DELETE /api/projects/[id]
Delete a project and associated files.

## Database Schema

The project system uses the following Prisma models:

```prisma
model Project {
  id          String    @id @default(uuid())
  name        String
  description String?
  category    String    @default("free")
  price       Int?
  githubRepo  String?
  owner       User      @relation(fields: [ownerId], references: [id])
  ownerId     String
  files       ProjectFile[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model ProjectFile {
  id          String   @id @default(uuid())
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId   String
  fileName    String
  appwriteId  String   @unique
  fileSize    Int
  mimeType    String
  fileUrl     String?
  isPublic    Boolean  @default(false)
  uploadedBy  User     @relation(fields: [uploadedById], references: [id])
  uploadedById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Components

### Project Listing (`/projects`)
- **Search functionality**: Real-time search across project names and descriptions
- **Category filtering**: Filter by free, paid, premium, or all projects
- **Responsive grid**: Adaptive layout for different screen sizes
- **Project cards**: Rich project information with badges and GitHub links

### Project Details (`/projects/[id]`)
- **Detailed view**: Complete project information and metadata
- **Purchase system**: Coin-based purchasing for paid projects
- **GitHub integration**: Direct links to source repositories
- **File management**: Access to project files and downloads

### Admin Dashboard (`/admin/projects`)
- **Statistics cards**: Overview of project counts by category
- **Data table**: Sortable and searchable project list
- **Bulk actions**: Edit, delete, and manage multiple projects
- **Quick actions**: Direct links to view, edit, and delete projects

### GitHub Import (`/admin/projects/import`)
- **OAuth integration**: Secure GitHub authentication
- **Repository browser**: Browse and search user repositories
- **Import configuration**: Set category, pricing, and descriptions
- **Batch import**: Import multiple repositories efficiently

## Usage

### Creating a Project

1. Navigate to `/admin/projects`
2. Click "Create Project"
3. Fill in project details:
   - Name (required)
   - Description (required)
   - Category (free/paid/premium)
   - Price (for paid/premium)
   - GitHub repository (optional)
4. Click "Create Project"

### Importing from GitHub

1. Navigate to `/admin/projects/import`
2. Connect your GitHub account
3. Browse and select repositories
4. Configure project settings
5. Click "Import Project"

### Managing Projects

1. Navigate to `/admin/projects`
2. Use search and filters to find projects
3. Use action buttons to:
   - View project details
   - Edit project information
   - Delete projects (with confirmation)

## Security Features

- **Input validation**: Server-side validation for all inputs
- **SQL injection protection**: Prisma ORM with parameterized queries
- **Authentication**: NextAuth.js integration for secure access
- **Authorization**: Role-based access control for admin features
- **CSRF protection**: Built-in Next.js CSRF protection

## Performance Optimizations

- **Database indexing**: Optimized queries with proper indexes
- **Pagination**: Server-side pagination for large datasets
- **Caching**: Efficient data fetching and caching strategies
- **Lazy loading**: Component-level lazy loading for better performance
- **Image optimization**: Next.js automatic image optimization

## Deployment

### Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Database Migration

```bash
npx prisma migrate dev
npx prisma generate
```

### Build and Deploy

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.