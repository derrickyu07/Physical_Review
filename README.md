# Physical Review

A full-stack fitness tracking application where users log meals, activities, and body metrics, then get an AI-assisted weekly health report with personalized, goal-aware recommendations.

## Highlights

- **Polyglot microservice architecture** — the Node/Express API owns auth, routing, and data; a separate Python (FastAPI) service owns report generation, communicating over HTTP.
- **AI-backed report advisor with graceful fallback** — a `WeeklyHealthReportService` accepts any `Advisor` (an interface, not a concrete class), so the OpenAI-backed advisor can be swapped for a deterministic rule-based one at construction time or at request time if the OpenAI call fails, with no changes to the rest of the pipeline.
- **PDF generation** — weekly reports are rendered server-side (Python, ReportLab/Matplotlib) into a downloadable PDF summarizing calories, macros, activity, and body metrics against the user's stated goals.
- **MET-based calorie calculation** for logged physical activity, USDA FoodData Central integration for meal logging/autocomplete, and computed goal-status logic (on track / behind / ahead) derived from logged data.

## Architecture

```
client/                  React 19 + Redux Toolkit + Vite frontend
server/                  Node.js + Express 5 REST API (auth, CRUD, orchestration)
health-report-service/   Python FastAPI microservice (PDF report generation + advisor logic)
```

The Node server owns routing, auth, and business orchestration; when a weekly report is requested, it calls the Python service over HTTP, which generates the PDF and returns it as a file response. This separation keeps report-generation logic (charting, PDF layout, LLM prompting) independent and independently testable from the rest of the API.

## Tech stack

**Frontend** — React 19, Redux Toolkit, React Router, React Hook Form + Yup validation, Axios, Vite, Tailwind CSS

**Backend** — Node.js, Express 5, MongoDB/Mongoose, JWT + bcrypt auth, express-validator, USDA FoodData Central API

**Report service** — Python, FastAPI, ReportLab, Matplotlib, OpenAI API (with a rule-based fallback advisor), Pydantic

## Features

- JWT-authenticated accounts with protected routes
- Meal logging with food autocomplete (USDA FoodData Central lookup)
- Physical activity logging with MET-based calorie-burn calculation
- Body metric tracking over time
- Goal setting with computed status (on track / behind / ahead) based on logged progress
- Dashboard summary view aggregating recent activity, meals, and metrics
- Weekly health report: AI-generated (or rule-based fallback) narrative advice, positive reinforcement, and concrete diet/lifestyle suggestions, rendered as a downloadable PDF

## Running locally

Each of the three services needs its own environment file — copy the relevant example and fill in your own values (see below for what's required).

**Backend**
```
cd server
npm install
npm run dev        # nodemon, http://localhost:5000
```

**Frontend**
```
cd client
npm install
npm run dev         # Vite, http://localhost:5173
```

**Report service**
```
cd health-report-service
python -m venv venv
venv\Scripts\activate      # Windows; use `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### Environment variables

`server/.env`
```
PORT=5000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<a long random secret>
USDA_API_KEY=<your USDA FoodData Central API key>
```

`health-report-service/.env`
```
OPENAI_API_KEY=<your OpenAI API key>   # optional — falls back to rule-based advice if omitted
```

None of these files are committed — see `.gitignore`.

## Status

Backend and core frontend flows (auth, meals, activities, body metrics, dashboard, weekly reports) are complete. The Goals feature is being finished out, and the app is being polished ahead of being presented as a portfolio piece.
