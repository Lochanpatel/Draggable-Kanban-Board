# 🗂️ Kanban Board — MEVN Stack

An interactive drag-and-drop Kanban board built with **MongoDB**, **Express.js**, **Vue 3**, and **Node.js**.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on `mongodb://localhost:27017`

---

## Setup & Running

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Kanban
```

### 2. Start the Backend

```bash
cd backend
npm install
npm start
```

> The API server starts on **http://localhost:5000**

### 3. Seed the Database (optional but recommended)

In a separate terminal, while the backend is running (or MongoDB is available):

```bash
cd backend
node seed.js
```

This clears any existing tasks and inserts **6 sample tasks** across all three statuses:

| Status | Tasks |
|--------|-------|
| Done | Set up project repository, Design database schema |
| In Progress | Build REST API, Implement drag-and-drop |
| To Do | Write unit tests, Deploy to production |

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

> The Vue app starts on **http://localhost:5173**

Open your browser and go to **http://localhost:5173** 🎉

---

## API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/tasks` | — | Retrieve all tasks |
| `POST` | `/tasks` | `{ title, description?, status? }` | Create a new task |
| `PATCH` | `/tasks/:id` | `{ title?, description?, status? }` | Update a task |
| `DELETE` | `/tasks/:id` | — | Delete a task |

---

## Data Flow

```
User Action (drag / add / delete)
        │
        ▼
KanbanBoard.vue (state: tasks[])
        │  Optimistic UI update (instant)
        ▼
api.js  →  PATCH /api/tasks/:id
        │
        ▼
Express routes/tasks.js
        │
        ▼
Mongoose → MongoDB (persisted)
        │
        └─ on success → toast "Moved to Done" ✅
           on failure → rollback + toast error ❌
```

**Data flow explained:**

1. All task state lives in a single `tasks` array in `KanbanBoard.vue` (Vue 3 `ref`).
2. `KanbanColumn.vue` computes its list via props filtered from that array.
3. When a card is dragged, `KanbanColumn` emits `task-dropped` with `{ taskId, newStatus }`.
4. `KanbanBoard` performs an **optimistic UI update** (changes status locally first) and simultaneously fires a `PATCH` request via `api.js`.
5. If the backend returns an error, the status is **rolled back** and an error toast is shown.
6. This pattern keeps the UI snappy while ensuring the database stays in sync.

---

## Project Structure

```
Kanban/
├── backend/
│   ├── models/Task.js       # Mongoose schema
│   ├── routes/tasks.js      # CRUD API routes
│   ├── server.js            # Express + MongoDB entry
│   ├── seed.js              # DB seed script
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── KanbanBoard.vue   # Main board, state, modals, toasts
    │   │   ├── KanbanColumn.vue  # Drop zone + task list
    │   │   └── TaskCard.vue      # Draggable card
    │   ├── api.js            # Axios service layer
    │   ├── App.vue
    │   ├── main.js
    │   └── style.css
    ├── index.html
    └── package.json
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 (Composition API) + Vite |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose v8 |
| Drag & Drop | Native HTML5 Drag-and-Drop API |

---

## Architectural Decisions

- **No Pinia**: App complexity is single-board; `ref/reactive` in `KanbanBoard.vue` is sufficient.
- **Optimistic UI**: Status changes are reflected immediately in the UI — the PATCH request runs in the background. If it fails, the change is rolled back.
- **Single source of truth**: All tasks live in one `tasks` array; columns are computed views (no duplicated state).
- **HTML5 Drag-and-Drop**: Used natively instead of a library to keep bundle size minimal and demonstrate API mastery.
