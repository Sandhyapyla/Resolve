# Issue Tracker

A modern issue tracking application built with Next.js, Firebase, and shadcn/ui. Track, manage, and organize your issues efficiently with real-time updates and intelligent similar issue detection.

![Issue Tracker](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?style=flat-square&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)

## Features

- **User Authentication**: Email/password authentication with Firebase Auth
- **Issue Management**: Create, read, update, and delete issues
- **Smart Detection**: Automatically detects similar existing issues when creating new ones
- **Filtering**: Filter issues by status and priority
- **Sorting**: Issues sorted by newest first (default)
- **Status Rules**: Enforces workflow rules (can't move directly from Open to Done)
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **shadcn/ui** for UI components
- **Sonner** for toast notifications

### Backend & Database
- **Firebase Firestore** for real-time database
- **Firebase Auth** for authentication

---

## 1. Why did you choose the frontend stack you used?

I chose **Next.js with TypeScript and shadcn/ui** for several strategic reasons:

### Next.js 15
- **App Router**: Provides a modern, file-based routing system with excellent developer experience
- **Server Components**: Optimizes performance by default with server-side rendering capabilities
- **API Routes**: Built-in serverless functions if needed for future expansions
- **Vercel Deployment**: Seamless deployment experience since Next.js is built by Vercel

### TypeScript
- **Type Safety**: Catches errors at compile time, especially important for handling Firestore data structures
- **IntelliSense**: Better developer experience with autocompletion and documentation
- **Maintainability**: Self-documenting code through type definitions

### shadcn/ui
- **Customizable**: Components are copied into the project, allowing full customization
- **Accessible**: Built on Radix UI primitives, ensuring accessibility out of the box
- **Beautiful Design**: Modern, clean aesthetic that looks professional
- **No Runtime Dependency**: Components are owned by the project, reducing bundle size

### Tailwind CSS
- **Utility-First**: Rapid UI development with consistent design tokens
- **No Context Switching**: Write styles directly in JSX without separate CSS files
- **Tree Shaking**: Only used styles are included in the final bundle

---

## 2. Firestore Data Structure

The application uses a simple, flat collection structure optimized for querying and scalability:

```
firestore/
└── issues/                    # Collection
    └── {issueId}/            # Document (auto-generated ID)
        ├── title: string          # Brief description of the issue
        ├── description: string    # Detailed description
        ├── priority: string       # "low" | "medium" | "high"
        ├── status: string         # "open" | "in_progress" | "done"
        ├── assignedTo: string     # Email or name of assignee
        ├── createdAt: Timestamp   # Firebase Timestamp
        ├── createdBy: string      # User UID
        └── createdByEmail: string # User's email address
```

### Design Decisions:

1. **Flat Structure**: All issues in a single collection for simplicity and easier querying
2. **Denormalized User Data**: Store `createdByEmail` alongside `createdBy` (UID) to avoid additional reads
3. **Timestamp**: Using Firebase Timestamp for accurate server-side timestamps and easy sorting
4. **String Enums**: Status and priority stored as strings for flexibility and readability

### Indexes Required:
The following composite indexes are needed for filtering:
- `status` + `createdAt` (descending)
- `priority` + `createdAt` (descending)
- `status` + `priority` + `createdAt` (descending)

---

## 3. Similar Issue Detection

The similar issue detection feature helps prevent duplicate issues by alerting users when they're about to create an issue that might already exist.

### How It Works:

1. **Trigger**: Detection runs after the user types at least 3 characters in the title field
2. **Debouncing**: A 500ms debounce prevents excessive API calls while typing
3. **Algorithm**:
   ```
   1. Extract significant words (>2 characters) from the new issue title
   2. Fetch all existing issues
   3. For each existing issue:
      a. Check if title/description contains any of the significant words
      b. Count matching words
      c. Consider "similar" if ≥50% of words match
   4. Return matching issues (up to 3 shown)
   ```

4. **User Experience**:
   - Shows a warning alert with similar issues listed
   - Allows users to review similar issues before creating
   - Users can still proceed if they determine it's a different issue

### Why This Approach:

- **Client-Side Filtering**: Simple implementation without additional infrastructure
- **Word-Based Matching**: More flexible than exact string matching
- **Non-Blocking**: Shows suggestions but doesn't prevent issue creation
- **Real-Time Feedback**: Users see similar issues as they type

### Limitations & Future Improvements:

- Could use Algolia or Elasticsearch for better full-text search
- Could implement TF-IDF or semantic similarity for smarter matching
- Could add machine learning for better duplicate detection

---

## 4. Challenges & Confusing Parts

### Challenge 1: Firebase Composite Indexes
When filtering by both status and priority, Firestore requires composite indexes. Initially, queries failed with error messages pointing to the Firebase console to create the required index. 

**Solution**: Pre-define the required indexes or let Firebase auto-create them on first query.

### Challenge 2: Date Serialization
Firebase Timestamps need to be converted to JavaScript Date objects on the client, and the conversion needs to happen consistently to avoid type mismatches.

**Solution**: Created a dedicated `docToIssue` function that handles all type conversions in one place.

### Challenge 3: Similar Issue Detection Performance
Fetching all issues for similarity checking could become slow with many issues.

**Solution**: Implemented debouncing and limited results. For production, would recommend a dedicated search service.

### Challenge 4: Status Transition Rules
Implementing the rule "Open cannot go directly to Done" required careful UI feedback to not frustrate users.

**Solution**: Added clear, friendly error messages explaining why the transition isn't allowed and what to do instead.

---

## 5. Future Improvements

1. **Search Functionality**: Add full-text search using Algolia or Firebase Extensions
2. **Real-Time Updates**: Implement Firestore listeners for live issue updates
3. **Comments**: Add ability to comment on issues
4. **Labels/Tags**: Categorize issues with custom labels
5. **Attachments**: Allow file uploads to issues
6. **Email Notifications**: Notify assignees when issues are assigned or updated
7. **Audit Log**: Track all changes made to issues
8. **Dark Mode Toggle**: Add user-controlled theme switching
9. **Export**: Export issues to CSV/PDF
10. **Analytics Dashboard**: Show issue statistics and trends

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project with Firestore and Authentication enabled
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/issue-tracker.git
   cd issue-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Run the development server:
```bash
npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment

The app is configured for easy deployment to Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard page
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects)
├── components/
│   ├── auth/              # Authentication components
│   ├── issues/            # Issue-related components
│   ├── layout/            # Layout components (Header)
│   └── ui/                # shadcn/ui components
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── lib/
│   ├── firebase.ts        # Firebase configuration
│   └── utils.ts           # Utility functions
├── services/
│   └── issues.ts          # Firestore issue operations
└── types/
    └── index.ts           # TypeScript type definitions
```

---

## License

MIT License - feel free to use this project for your own purposes.
