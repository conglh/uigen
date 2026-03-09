/us# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Style

- Use comments sparingly. Only comment complex code.

## Commands

- `npm run setup` — Install deps, generate Prisma client, run migrations
- `npm run dev` — Start dev server (Next.js with Turbopack, port 3000)
- `npm run dev:daemon` — Start dev server in background (logs to logs.txt)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm test` — Run all tests (vitest, jsdom environment)
- `npx vitest run src/lib/__tests__/file-system.test.ts` — Run a single test file
- `npm run db:reset` — Reset SQLite database

## Database

The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database.

## Architecture

UIGen is an AI-powered React component generator. Users describe components in a chat interface, and an LLM generates code that renders in a live preview — all without writing files to disk.

### Core Data Flow

1. **Chat** (`src/lib/contexts/chat-context.tsx`) — Wraps Vercel AI SDK's `useChat`, sends messages to `/api/chat` with the serialized virtual file system
2. **API route** (`src/app/api/chat/route.ts`) — Calls Claude via `@ai-sdk/anthropic` with two tools: `str_replace_editor` and `file_manager`. Reconstructs a `VirtualFileSystem` from the request, passes it to tools, and streams responses back
3. **Tool calls** — The LLM creates/edits/deletes files in the virtual FS. Tool results flow back to the client where `FileSystemContext.handleToolCall` mirrors the same operations client-side
4. **Preview** (`src/components/preview/PreviewFrame.tsx`) — Transforms all virtual files with `@babel/standalone`, creates blob URLs, builds an import map, and renders everything in a sandboxed iframe. Third-party imports resolve via `esm.sh`

### Key Abstractions

- **VirtualFileSystem** (`src/lib/file-system.ts`) — In-memory tree of `FileNode`s. Exists on both server (in API route) and client (in context). Supports serialize/deserialize for transport over the wire
- **JSX Transformer** (`src/lib/transform/jsx-transformer.ts`) — Babel-based transform that produces browser-ready ES modules. Generates import maps with `@/` alias support and creates placeholder modules for missing imports
- **MockLanguageModel** (`src/lib/provider.ts`) — When no `ANTHROPIC_API_KEY` is set, a mock provider returns static component code so the app runs without API access

### Auth & Persistence

- JWT-based auth via `jose` (`src/lib/auth.ts`), middleware protects `/api/projects` and `/api/filesystem`
- Prisma + SQLite (`prisma/schema.prisma`) — `User` and `Project` models. Projects store serialized messages and file system data as JSON strings
- Anonymous users get the full editor without persistence. Authenticated users' projects auto-save on chat completion

### UI Structure

- `/` — Anonymous editor or redirect to most recent project for authenticated users
- `/[projectId]` — Project page (requires auth)
- `src/app/main-content.tsx` — Shared layout: resizable panels with chat on the left, code editor + preview on the right
- UI components use shadcn/ui (Radix primitives + Tailwind + `class-variance-authority`)

### Generated Component Conventions

The LLM is instructed (via `src/lib/prompts/generation.tsx`) to:
- Always create a root `/App.jsx` as the entry point
- Use Tailwind for styling, no hardcoded styles
- Use `@/` import alias for local files
- Operate on a virtual FS rooted at `/`
