# Notes App (React + Firebase + Cloudinary)

[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v9-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![MUI](https://img.shields.io/badge/MUI-v5-007FFF?style=for-the-badge&logo=mui)](https://mui.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

A modern notes + file manager app with authentication, CRUD notes, and file uploads (PDF/DOC/images/audio/video). Built for a clean UX and easy reporting: this README is structured so you can directly reuse sections in a project report.

## Project overview (for report)

- **Problem statement**: Users need a simple, secure place to store notes and upload common file types, with quick preview/open/download options across devices.
- **Objectives**:
  - Provide secure login (email/password + Google)
  - Create/edit/archive/trash notes
  - Upload files and store their metadata
  - Preview/open in browser and download with correct file extensions
- **Outcome**: A responsive web app with a unified “file card” UI and real-time persistence using Firebase.

## Key features

- **Authentication**: Email/password + Google sign-in, password reset
- **Notes workflow**: Create, update, archive, trash, restore, delete forever
- **File notes**:
  - Upload: PDF/DOC/DOCX/TXT/images/audio/video
  - Preview: image preview, PDF iframe preview, DOC/DOCX via Google viewer, native audio/video controls
  - Actions: Open/View in new tab + Download
  - Download names preserve proper file extensions (important for Windows)
- **UX**: Responsive layout, snackbars for feedback, backdrop loader states
- **Theme**: Light/Dark mode support (via MUI theme)

## Tech stack

- **Frontend**: React, React Router, Material UI (MUI), Emotion
- **Backend services**:
  - **Firebase Auth**: authentication
  - **Firestore**: note + metadata storage
  - **Cloudinary**: file hosting (uploads from client using unsigned preset)

## Architecture & data flow

### High-level flow

1. User logs in via Firebase Auth.
2. Notes are stored in Firestore under the logged-in user.
3. When uploading a file note:
   - The file is uploaded to Cloudinary.
   - Firestore stores metadata (title, description, fileName, fileType, fileSize, fileUrl).
4. The UI renders a unified card:
   - Shows preview if supported
   - Provides Open/View and Download actions

### Data model (Firestore)

Collection layout (conceptual):

```text
userData/{uid}/notes/{noteId}
```

Example document fields:

- `title`: string
- `note`: string (description)
- `date`: Timestamp
- `lastEdited`: Timestamp
- `isNote` / `isArchived` / `isTrashed`: boolean
- `isFile`: boolean
- `fileName`: string
- `fileType`: string (may be empty on some devices; the app falls back to file extension)
- `fileSize`: number (bytes)
- `fileUrl`: string (Cloudinary `secure_url`)
- `cloudinaryPublicId`: string (for reference)

## Setup & run locally

### Prerequisites

- Node.js (LTS recommended)
- npm

### 1) Install dependencies

```bash
npm install
```

### 2) Environment variables

Create a `.env` in the project root (or update your existing one):

```bash
# Firebase (client)
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_MEASUREMENT_ID=...

# Cloudinary (client upload)
REACT_APP_CLOUDINARY_CLOUD_NAME=...
REACT_APP_CLOUDINARY_UPLOAD_PRESET=...
```

### 3) Firebase console checklist

- **Auth**: enable Email/Password and Google providers
- **Authorized domains**: add `localhost` for local testing
- **Firestore rules**: ensure authenticated users can only access their data (recommended for production)

### 4) Run

```bash
npm start
```

### Production build

```bash
npm run build
```

## Project structure

```text
notes-app/
├── public/
├── src/
│   ├── components/
│   │   └── layout/            # Dashboard/Layout/Note card UI
│   ├── context-api/           # Global state (loader/snackbar/drawer)
│   ├── shared/                # Themes + shared UI utilities
│   ├── App.js
│   ├── firebase.js            # Firebase + Cloudinary helpers + CRUD
│   └── index.js
└── package.json
```

## UX notes (for report)

- **Consistency**: File cards share the same action layout (Open/View + Download).
- **Feedback**: Upload/delete actions show snackbars; loading states are centralized.
- **Resilience**: Some devices provide empty MIME types; the app falls back to filename extensions for previews and download naming.

## Known limitations

- **Cloudinary deletion**: Unsigned client-side deletion is not supported. The app removes Firestore references; actual assets should be cleaned via Cloudinary dashboard or a backend endpoint.
- **Office previews**: DOC/DOCX preview relies on Google viewer; availability depends on public access to the file URL.
- **Tests**: This project may not include automated tests yet.

## Future improvements

- Backend endpoint for **signed upload + secure delete** on Cloudinary
- Role-based access / shared notes
- Full-text search and tags
- Drag-and-drop upload + progress indicator
- Lightbox image viewer (zoom, next/prev)
- Add unit/integration tests and CI pipeline

## Screenshots (add for report)

Add images here and reference them:

- `docs/screenshots/login.png`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/file-note.png`

## License

MIT. See [`LICENSE`](LICENSE).