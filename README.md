# TaskFlow — Modern To-Do List App

A beautifully crafted, production-ready to-do list web application designed with modern UI/UX principles. TaskFlow combines clean aesthetics with powerful task management features, making it an ideal portfolio project for frontend developers.

## Features

### Core Functionality
- **Add Tasks** — Create new tasks with a single click or by pressing Enter
- **Edit Tasks** — Inline editing with keyboard shortcuts (Enter to save, Escape to cancel)
- **Delete Tasks** — Remove individual tasks with confirmation dialogs
- **Mark Complete** — Toggle task completion with animated checkboxes
- **Filter Tasks** — Switch between All, Active, and Completed views
- **Clear Completed** — Bulk-remove all completed tasks at once
- **Data Persistence** — All tasks are saved to `localStorage` and survive page refreshes

### UI/UX Highlights
- **Dark Mode** — Full dark/light theme toggle with saved preference
- **Progress Bar** — Visual indicator showing completion percentage
- **Task Counts** — Real-time display of total, active, and completed task counts
- **Empty States** — Contextual empty state messages for different scenarios
- **Smooth Animations** — Slide-in, fade, bounce, and float animations throughout
- **Toast Notifications** — Non-intrusive feedback for user actions
- **Confirmation Dialogs** — Prevents accidental deletions
- **Duplicate Detection** — Warns users when adding duplicate tasks
- **Glassmorphism Design** — Frosted glass cards with backdrop blur effects
- **Gradient Backgrounds** — Soft, professional color gradients
- **Responsive Layout** — Optimized for mobile, tablet, and desktop screens
- **Micro-interactions** — Hover effects, button scaling, and smooth transitions

## Technologies Used

| Technology       | Purpose                              |
|------------------|--------------------------------------|
| Next.js 16       | React framework with App Router      |
| TypeScript 5     | Type-safe JavaScript                 |
| Tailwind CSS 4   | Utility-first CSS framework          |
| Lucide React     | High-quality SVG icon library        |
| next-themes      | Dark mode theme management           |
| localStorage     | Client-side data persistence         |

## Project Structure

```
todo-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with ThemeProvider
│   │   ├── page.tsx         # Main To-Do application component
│   │   └── globals.css      # Global styles and custom animations
│   ├── components/
│   │   ├── theme-provider.tsx  # Theme configuration wrapper
│   │   └── ui/                 # Reusable UI components (shadcn/ui)
│   └── lib/
│       ├── utils.ts        # Utility functions
│       └── db.ts           # Database utilities
├── prisma/
│   └── schema.prisma       # Database schema
├── public/
│   ├── logo.svg            # App logo
│   └── robots.txt          # SEO configuration
├── package.json            # Dependencies and scripts
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── README.md               # This file
```

## Screenshots

> Screenshots will be added here. The application features:
> - A gradient purple/indigo background in light mode
> - A deep dark gradient in dark mode
> - Glass-effect cards with backdrop blur
> - Animated task items with smooth transitions
> - A progress bar showing completion status
> - Filter tabs with active state indicators

## Getting Started

### Prerequisites
- **Node.js** 18+ or **Bun** runtime
- **npm**, **yarn**, or **bun** as package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/taskflow.git
cd taskflow

# Install dependencies
npm install
# or: bun install

# Start the development server
npm run dev
# or: bun run dev
```

The application will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm run start
```

## Usage Guide

1. **Adding a Task** — Type your task in the input field and press Enter or click the add button
2. **Completing a Task** — Click the circle checkbox next to any task to mark it as done
3. **Editing a Task** — Hover over a task and click the pencil icon; press Enter to save
4. **Deleting a Task** — Hover over a task and click the trash icon; confirm in the dialog
5. **Filtering Tasks** — Use the All / Active / Done tabs to view different task groups
6. **Clearing Completed** — Click "Clear completed" in the footer to remove all finished tasks
7. **Toggling Dark Mode** — Click the moon/sun icon in the top-right corner

## Design Principles

- **Minimal & Clean** — Every element serves a purpose; no visual clutter
- **Accessible** — Keyboard navigable, ARIA labels, proper semantic HTML
- **Responsive** — Works beautifully on all screen sizes from 320px upward
- **Performant** — Optimized rendering with `useCallback` and efficient state management
- **User-Friendly** — Clear feedback for every action, no ambiguous states

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Follow the prompts and your app will be live in seconds.

### Deploy to Netlify

1. Push your code to a GitHub repository
2. Go to [Netlify](https://netlify.com) and click "New site from Git"
3. Select your repository
4. Set build command: `npm run build`
5. Set publish directory: `.next`
6. Click "Deploy site"

> **Note:** For static export, add `output: 'export'` to `next.config.ts`.

## Future Improvements

- [ ] **Drag & Drop Reordering** — Rearrange tasks by dragging them
- [ ] **Due Dates & Reminders** — Set deadlines with notification alerts
- [ ] **Priority Levels** — Color-coded priority tags (high, medium, low)
- [ ] **Categories / Labels** — Organize tasks into custom categories
- [ ] **Search Functionality** — Quickly find tasks with a search bar
- [ ] **Cloud Sync** — Sync tasks across devices using a backend API
- [ ] **User Authentication** — Login with email or social accounts
- [ ] **Collaborative Lists** — Share task lists with team members
- [ ] **Recurring Tasks** — Auto-create tasks on a schedule
- [ ] **Statistics Dashboard** — Visual analytics of task completion trends
- [ ] **Export Options** — Download tasks as CSV or PDF
- [ ] **Keyboard Shortcuts** — Full keyboard navigation (e.g., `j`/`k` to move between tasks)
- [ ] **Custom Themes** — Let users choose from multiple color palettes
- [ ] **Sound Effects** — Subtle audio feedback for actions
- [ ] **Offline Support** — Service worker for full offline capability

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with Next.js, TypeScript, and Tailwind CSS.
