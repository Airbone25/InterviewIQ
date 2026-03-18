# InterviewIQ — AI Mock Interview Platform

An AI-powered mock interview platform that simulates realistic interviews, evaluates answers, identifies skill gaps, and generates learning roadmaps.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| AI | Groq (LLaMA 3 70B + Whisper) |
| Auth | JWT + bcrypt |
| Deploy | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
interviewiq/
├── frontend/          # React app
│   ├── src/
│   │   ├── pages/     # Landing, Login, Signup, Dashboard, Interview, Results
│   │   ├── components/ # Navbar
│   │   ├── context/   # Auth store (Zustand)
│   │   └── index.css  # Global styles
│   ├── vercel.json
│   └── package.json
│
└── backend/           # Express API
    ├── models/        # User, Interview, Report
    ├── routes/        # auth, resume, interviews, reports, speech
    ├── middleware/    # JWT auth
    ├── services/      # groqService.js (all AI logic)
    ├── server.js
    ├── render.yaml
    └── package.json
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Groq API key (free at console.groq.com)

### 1. Clone and install

```bash
# Backend
cd backend
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, GROQ_API_KEY
npm install
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`
Backend runs at `http://localhost:5000`

### 2. Environment Variables

**Backend `.env`:**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<64-char random string>
JWT_EXPIRES_IN=7d
GROQ_API_KEY=gsk_...
FRONTEND_URL=http://localhost:5173
```

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Frontend `.env`:**
```
VITE_API_URL=   # empty = uses Vite proxy to localhost:5000
```

---

## Production Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repo
4. Set these environment variables in the Render dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GROQ_API_KEY`
   - `FRONTEND_URL` (your Vercel URL — add after deploying frontend)
5. Build command: `npm install`
6. Start command: `node server.js`

Your API URL will be: `https://interviewiq-api.onrender.com`

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variable:
   - `VITE_API_URL` = `https://interviewiq-api.onrender.com`
4. Deploy

---

## Core Features

### AI Interview Flow
1. User creates an account and (optionally) uploads resume
2. Selects interview type: Technical / Behavioral / HR / Company-style
3. AI conducts 8-question interview with adaptive difficulty
4. Each answer saved, quick-scored for difficulty adaptation
5. After last answer: full AI evaluation runs
6. Report generated with scores, gaps, question breakdown, and roadmap

### Interview Types
- **Technical** — algorithms, system design, coding concepts
- **Behavioral** — STAR method, leadership, conflict handling
- **HR** — culture fit, career goals, compensation
- **Company-style** — Google, Amazon, Meta, Apple, Microsoft, Netflix, Stripe, Airbnb

### Scoring Dimensions
- Technical accuracy (0–10)
- Communication clarity (0–10)
- Answer depth (0–10)
- Confidence indicators (0–10)
- Problem-solving approach (0–10)
- Overall (weighted average)

### Adaptive Difficulty
Questions start at difficulty 5/10. After each answer:
- Score ≥ 8: difficulty increases by 1
- Score ≤ 3: difficulty decreases by 1
- This tracks per-session, not globally

### Gamification
| Badge | Condition |
|-------|-----------|
| First Interview | Complete 1 interview |
| 3-day Streak | Interview on 3 consecutive days |
| High Scorer | Average score ≥ 8 |
| Consistent | Complete 5+ interviews |

---

## API Reference

### Auth
```
POST /api/auth/register    { name, email, password }
POST /api/auth/login       { email, password }
GET  /api/auth/me          (requires Bearer token)
```

### Resume
```
POST /api/resume/upload    multipart/form-data, field: "resume"
GET  /api/resume
```

### Interviews
```
POST /api/interviews                      { type, company, difficulty }
GET  /api/interviews                      ?limit=20&page=1
GET  /api/interviews/stats
GET  /api/interviews/:id
POST /api/interviews/:id/question         { answers: [] }
POST /api/interviews/:id/answer           { answer, questionIndex }
POST /api/interviews/:id/complete
DELETE /api/interviews/:id
```

### Reports
```
GET /api/reports/:interviewId
GET /api/reports
```

### Speech
```
POST /api/speech/transcribe    multipart/form-data, field: "audio"
```

---

## AI Prompting Strategy

The Groq service uses distinct prompts for each phase:

- **Resume analysis**: Extract structured JSON from raw resume text
- **First question**: Persona + resume context → opening question
- **Follow-up questions**: Full conversation history + adaptive difficulty note
- **Quick scoring**: Single number 1–10 for difficulty adjustment
- **Brief feedback**: One sentence acknowledgment (mid-interview only)
- **Full evaluation**: Complete JSON report with all scores, breakdown, gaps, roadmap

All prompts instruct the model to return JSON where needed — the service strips markdown fences and parses safely with a fallback.

---

## Security

- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens expire in 7 days
- All AI routes rate-limited to 20 req/min
- Global API rate limit: 200 req/15min
- Input validation on all auth routes
- Interview ownership verified on every request
- Helmet.js security headers

---

## License

MIT
