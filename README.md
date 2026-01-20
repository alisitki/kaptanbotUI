# HedgeBot Control Panel

A premium, dark-themed control panel for a hedge trading bot, built with Next.js 14, Tailwind CSS, and shadcn/ui.

## Features

- **Premium UI**: "Bloomberg x Linear" aesthetic with dark mode and neon accents.
- **Real-time Monitoring**: Live updates for Price, PnL, and Bot State via Mock API.
- **Strategy Management**: Visual rule editor and state machine preview.
- **Risk Controls**: Global circuit breakers and exposure limits.
- **Audit Logs**: Detailed event timeline with state snapshots.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Icons**: lucide-react
- **Data Fetching**: SWR
- **State**: Mock In-Memory API (Server-side)

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    # or
    yarn
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open Application**:
    Navigate to [http://localhost:3001](http://localhost:3001)

## Project Structure

- `/app`: App Router pages and API routes.
- `/components`: Reusable UI components.
    - `/layout`: Sidebar, Topbar.
    - `/dashboard`: Metric cards.
    - `/strategy`: Strategy form and preview.
- `/lib`: Utility functions, types, and mock data.

## Mock API

The application runs with a built-in mock API for demonstration:
- `GET /api/mock/state`: Returns current bot state (price, positions, levels).
- `GET /api/mock/decisions`: Returns recent decision logs.
