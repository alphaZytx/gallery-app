# Gallery App

A full-stack media gallery that pairs a polished React front end with an Express/Node.js API. Admins can authenticate, upload high-resolution images or videos, curate metadata, and publish them instantly to a paginated public gallery. Media files are streamed from Vercel Blob storage while metadata lives in Upstash Redis, making the project production-ready out of the box.

## Table of contents
- [Features](#features)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment variables](#environment-variables)
- [Running the app](#running-the-app)
  - [Development](#development)
  - [Builds](#builds)
- [Testing](#testing)
- [API reference](#api-reference)
- [Architecture notes](#architecture-notes)
- [Deployment tips](#deployment-tips)
- [Troubleshooting](#troubleshooting)

## Features

### Public experience
- Responsive gallery layout with modals for rich previews and download links.
- Infinite-ready pagination with graceful empty/error states and loading spinners.
- Optimised media streaming through the API so the browser never touches the storage token directly.

### Admin experience
- Email/password authentication backed by JWTs stored securely in memory/localStorage.
- Drag-and-drop ready upload form that accepts both images and videos with automatic size/type validation.
- Real-time dashboard that supports create, update, and delete operations with confirmation modals and inline feedback.

### Backend capabilities
- Upload pipeline stores files in Vercel Blob and tracks metadata in Upstash Redis for instant reads.
- Public endpoints wrap Vercel Blob streaming for secure view/download URLs while keeping tokens private.
- Comprehensive error handling and configuration guards to prevent misconfigured secrets from starting the server.

## Tech stack

| Layer        | Technology |
| ------------ | ---------- |
| Front end    | React 19, React Router, Styled Components, Axios |
| Back end     | Express 4, Multer, JSON Web Tokens |
| Storage      | Vercel Blob (media) & Upstash Redis (metadata) |
| Tooling      | Nodemon, React Scripts, Testing Library |

## Repository structure

```
.
├── client      # React single-page application
│   ├── src
│   │   ├── pages            # Public gallery + admin pages
│   │   ├── components       # Reusable UI (media grid, modals, forms)
│   │   ├── context          # Auth provider and hooks
│   │   └── api              # Axios client and helpers
│   └── package.json
├── server      # Express API
│   ├── routes              # Auth + media endpoints
│   ├── controllers         # Upload, retrieval, deletion logic
│   ├── middleware          # JWT protection, upload handling
│   ├── config              # Upstash Redis + storage configuration
│   └── server.js           # App bootstrap and error handling
└── vercel.json
```

## Getting started

### Prerequisites
- Node.js 18+ (ensures compatibility with the ESM server and modern React toolchain)
- npm 8+ (ships with recent Node releases)
- Upstash Redis database & Vercel Blob store credentials

### Installation

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Environment variables

Create two files—one for the API (`server/.env`) and one for the client (`client/.env.local`). Never commit these files.

#### Server `.env`

| Variable | Description |
| -------- | ----------- |
| `PORT` | Optional. Defaults to `5001` during local development. |
| `CLIENT_URL` | Origin allowed by CORS (e.g. `http://localhost:3000`). |
| `JWT_SECRET` | Strong secret used to sign admin access tokens. |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `1h`, `7d`). |
| `ADMIN_EMAIL` | Admin login username. |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of the admin password. Prefer this in production. |
| `ADMIN_PASSWORD` | Optional. Plaintext password that is hashed at boot for local use. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob access token with read/write scope. |
| `UPSTASH_REDIS_REST_URL` | Upstash REST endpoint. |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token. |
| `GALLERY_PAGE_LIMIT` | Optional default page size for gallery endpoints (defaults to 12). |

> Tip: to generate `ADMIN_PASSWORD_HASH` run `node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"`.

#### Client `.env.local`

| Variable | Description |
| -------- | ----------- |
| `REACT_APP_API_URL` | Base URL for API requests (e.g. `http://localhost:5001/api`). |
| `REACT_APP_GALLERY_PAGE_LIMIT` | Optional override for items per gallery page. |

## Running the app

### Development

In two terminals:

```bash
# Terminal 1 - start the API
cd server
npm run dev

# Terminal 2 - launch the React dev server
cd client
npm start
```

The client proxies API calls to the `REACT_APP_API_URL`. When both services are running locally you can log in at `http://localhost:3000/admin/login` and browse the public gallery on the root route.

### Builds

```bash
# Production build for the React app
cd client
npm run build

# Production start for the API
cd server
npm start
```

Deploy the `client/build` output to a static host (Vercel, Netlify, etc.) and the server to a Node-compatible platform with access to your environment variables.

## Testing

The client ships with React Testing Library. Run the suite from the `client` directory:

```bash
npm test
```

(There are currently no automated API tests in the repository.)

## API reference

| Method & Path | Description |
| ------------- | ----------- |
| `POST /api/auth/login` | Authenticate the admin and receive a JWT. |
| `GET /api/media/gallery` | Paginated public gallery feed. Accepts `page` & `limit`. |
| `GET /api/media/view/:pathname` | Stream a stored media asset via the API. |
| `GET /api/media/download/:pathname` | Download an asset with the original filename. |
| `GET /api/media/admin/all` | (Auth) Fetch every media record for dashboard management. |
| `POST /api/media/upload` | (Auth) Upload images/videos, store in Blob + Redis. |
| `PUT /api/media/edit/:id` | (Auth) Update media name/tags. |
| `DELETE /api/media/delete/:id` | (Auth) Remove media from Blob and Redis. |

All protected routes require the `Authorization: Bearer <token>` header using the JWT returned by the login endpoint.

## Architecture notes

1. **Upload flow** – Admin uploads pass through Multer (in-memory), upload to Vercel Blob, then persist metadata in Upstash. The Redis sorted set maintains chronological ordering for gallery pagination.
2. **Public delivery** – Gallery endpoints fetch from Redis and generate signed view/download routes that proxy Vercel Blob streams, keeping blob tokens secure.
3. **Admin UX** – React context tracks auth state in localStorage, ensures protected routes, and provides optimistic UI updates when media is created, edited, or deleted.
4. **Resilience** – Startup logs warn when critical secrets are missing, and global Express error handling returns structured responses for Multer and generic failures.

## Deployment tips

- Keep the API and client origins in sync using `CLIENT_URL` and `REACT_APP_API_URL` to avoid CORS issues.
- Vercel Blob tokens should be rotated periodically; they can be scoped per environment.
- Upstash is HTTP-based, so the server works in serverless environments like Vercel Functions or AWS Lambda.

## Troubleshooting

| Symptom | Likely cause | Fix |
| ------- | ------------ | --- |
| `Database service unavailable` responses | Missing Upstash credentials or placeholder URL/token values. | Double-check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env`. |
| `Server configuration error (blob token)` | `BLOB_READ_WRITE_TOKEN` is missing or still the sample token. | Generate a token in Vercel Blob and update your `.env`. |
| Login always fails | Admin email/password hash not configured. | Ensure both `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` (or `ADMIN_PASSWORD` for dev) are set. |
| File upload rejected | File type/size outside allowed range. | Confirm the asset is an image/video and under the configured size limits. |

Enjoy building on top of the Gallery App! 🎨
