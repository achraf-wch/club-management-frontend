# Club Management Frontend

React frontend for the Club Management Platform. This application provides the user interface for admins, presidents, board members, and club members to manage clubs, events, profiles, requests, and tickets.

## Overview

The frontend is designed around a role-aware experience:

- `admin` manages clubs and presidents
- `president` manages club operations directly
- `board` uses the shared club workspace with approval-driven actions where required
- `member` accesses the member dashboard and participation flows

The current architecture centralizes president and board club features into a shared `/club` area to avoid duplicated components.

## Core Features

- authentication and role-based redirection
- shared club workspace for `president` and `board`
- member creation and request flows
- club management and profile pages
- event creation, management, recap, and ticket assignment
- QR ticket scanning with `html5-qrcode`
- public club and event browsing
- admin dashboard for club setup

## Stack

- React 19
- React Router DOM 7
- Create React App tooling
- Tailwind CSS
- Axios
- i18next / react-i18next
- html5-qrcode

## Project Structure

```text
src/
  Componenets/
  Context/
  features/
    club/
      pages/
  Layout/
  layouts/
  Pages/
    Admin/
    Login/
    Member/
```

## Requirements

- Node.js 18+
- npm
- Running backend API, typically on `http://localhost:8000`

## Configuration

This app reads the backend base URL from:

```env
REACT_APP_API_URL=http://localhost:8000
```

If `REACT_APP_API_URL` is not set, several pages fall back to `http://localhost:8000`.

Create a `.env` file in the frontend root if you want to override the API URL locally.

## Installation

```bash
npm install
```

## Development

Start the frontend locally:

```bash
npm start
```

The app will usually run at:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm start
npm run build
npm test
```

## Shared Club Architecture

President and board features now live in the shared club module under:

- [src/features/club/pages](./src/features/club/pages)
- [src/layouts/ClubLayout.jsx](./src/layouts/ClubLayout.jsx)

This means:

- one dashboard implementation for both roles
- one add-member flow
- one create-event flow
- one member-list flow
- one assign-ticket flow
- one manage-club flow

Role differences are handled inside the shared pages and through route protection instead of duplicating entire screens.

## Routing Summary

- `/` public home
- `/clubs` public club listing
- `/events` public event listing
- `/admin/*` admin area
- `/club/*` shared president/board workspace
- `/Member/Dashboard` member dashboard
- `/Login/login` authentication

Legacy president and board URLs are redirected to the shared `/club` routes for compatibility.

## Backend Integration Notes

- Authenticated requests use `credentials: include`
- The backend should allow cookies/sessions for local development
- Most club-aware pages resolve context through `/api/my-club-info` and fall back when needed

## Build

Create a production build with:

```bash
npm run build
```

The output is generated in:

```text
build/
```

## Known Development Notes

- Some builds may show source-map warnings from `html5-qrcode`; these do not necessarily block compilation
- The repository currently contains some pre-existing ESLint warnings unrelated to the shared club refactor

## Troubleshooting

If login succeeds but role-based navigation looks wrong:

- confirm the backend is returning both `role` and `club_role`
- clear local storage and log in again

If authenticated pages fail to load data:

- verify `REACT_APP_API_URL`
- verify the backend is running
- confirm cookies are accepted in the browser

If QR scanning does not work:

- use HTTPS or localhost where camera APIs are allowed
- confirm browser camera permissions are granted

## Recommended Workflow

For local development:

1. Start the backend and database first.
2. Start the frontend with `npm start`.
3. Log in with a role-based test account.
4. Verify the shared `/club` flows for president and board.

## License

This project is part of the Club Management Platform codebase. Adjust final licensing details based on your delivery or organization requirements.
