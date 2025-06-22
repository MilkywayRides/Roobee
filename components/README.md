# Components Documentation

## Navbar Component

The `Navbar` component provides a responsive navigation bar with the following features:

### Features
- **Responsive Design**: Works on desktop and mobile
- **Theme Toggle**: Light/dark mode switching
- **User Authentication**: Shows different content for logged-in vs anonymous users
- **Admin Badge**: Displays admin badge for admin users
- **Mobile Menu**: Slide-out menu for mobile devices
- **GitHub Link**: Quick access to GitHub profile

### Usage

```tsx
import { Navbar } from "@/components/navbar";

export default function MyPage() {
  return (
    <div>
      <Navbar />
      {/* Your page content */}
    </div>
  );
}
```

## MainLayout Component

The `MainLayout` component provides a consistent layout wrapper that includes the navbar.

### Props
- `children`: React nodes to render inside the layout
- `showNavbar` (optional): Boolean to control navbar visibility (default: true)

### Usage

```tsx
import { MainLayout } from "@/components/layout/main-layout";

export default function MyPage() {
  return (
    <MainLayout>
      {/* Your page content */}
    </MainLayout>
  );
}

// Or without navbar
export default function AuthPage() {
  return (
    <MainLayout showNavbar={false}>
      {/* Login/Register content */}
    </MainLayout>
  );
}
```

### Navigation Items

The navbar includes the following navigation links:
- Home (`/`)
- Projects (`/projects`)
- Posts (`/posts`)
- Terminal (`/terminal`)

### User Menu Features

For logged-in users:
- Profile dropdown with avatar
- Admin badge (if admin role)
- Quick access to profile, dashboard, and admin panel
- Sign out functionality

For anonymous users:
- Sign In button
- Get Started button

### Mobile Features

- Hamburger menu for mobile devices
- Slide-out sheet with full navigation
- User information and actions in mobile menu
- Theme toggle accessible on mobile 