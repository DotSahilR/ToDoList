# Todo App

I built a full-stack dark-themed task board that lets me create, edit, toggle, filter, search, sort, and delete tasks persisted in MongoDB Atlas.

## Tech stack

- Frontend: React 18, TypeScript 5, Vite 5, React Router v6, Axios, CSS Modules
- Backend: Node.js 20 LTS, TypeScript 5, Express 4, Mongoose 8, tsx, dotenv, cors
- Database: MongoDB Atlas (M0 free tier)

## MongoDB Atlas setup

1. I create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. I create an M0 free cluster.
3. I create a database user with username/password.
4. I whitelist `0.0.0.0/0` in Network Access so local and cloud deployments can connect.
5. I copy the SRV connection string and put it in `server/.env` as `MONGODB_URI`.

## Local setup

```bash
git clone https://github.com/your-username/todo-app
cd todo-app

# Backend
cd server && npm install
cp .env.example .env
# Add your MONGODB_URI to .env
npm run dev

# Frontend (new terminal)
cd client && npm install
cp .env.example .env
npm run dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:4000
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| PORT | No | Server port, defaults to 4000 |
| MONGODB_URI | Yes | Atlas connection string |
| CLIENT_URL | No | Frontend origin for CORS |
| VITE_API_URL | Yes | Backend base URL (frontend) |

## API endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/tasks` | Fetch all tasks |
| GET | `/api/tasks/:id` | Fetch one task by ID |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update task name and/or status |
| PATCH | `/api/tasks/:id` | Toggle status only |
| DELETE | `/api/tasks/:id` | Delete a task |

## Deployment links

- Frontend: https://your-frontend.vercel.app
- Backend: https://your-backend.onrender.com

## Bonus features implemented

- Client-side filtering via nav tabs (`All`, `Incomplete`, `Complete`)
- Expandable header search with real-time filtering
- Client-side sorting (`Newest`, `Oldest`, `Name A→Z`, `Name Z→A`)
- Inline task rename on click with Enter/blur save and Escape cancel

## Known limitations

Tasks persist in MongoDB Atlas — no data loss on server restart. Free tier Atlas has 512MB storage limit, sufficient for this scope.
