# Commerce Appointment System

Full-stack appointment booking application with a React frontend and Spring Boot backend.

Users can choose a banking topic, select a branch, pick an available time slot, enter contact details, and submit an appointment.

## Tech Stack

- Frontend: React, Vite, React Router
- Backend: Java 21, Spring Boot, Spring Web MVC, Spring Data JPA
- Database: PostgreSQL

## Repository Structure

```text
.
|-- frontend/              # React + Vite client
|-- backend/               # Spring Boot API
|   |-- src/main/java/...  # Controllers, services, models, repositories
|   |-- src/main/resources/application.properties
|   `-- database/          # schema.sql and seed data
`-- README.md
```

## Prerequisites

Install these tools before running the project:

- Node.js 20+ and npm
- Java 21
- PostgreSQL 14+

## Quick Start

### 1) Database Setup

1. Create a PostgreSQL database.  
   The backend currently points to `appointment_system` in `backend/src/main/resources/application.properties`.

2. Run the schema script:
   - `backend/database/schema.sql`

3. Load branch data:
   `backend/database/UpdatedSeed.sql`

4. Update DB connection settings in `backend/src/main/resources/application.properties` if needed:
   - `spring.datasource.url`
   - `spring.datasource.username`
   - `spring.datasource.password`

### 2) Run the Backend (Spring Boot)

From `backend/`:

```bash
# macOS/Linux
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

Default backend URL: `http://localhost:8080`

### 3) Run the Frontend (React + Vite)

From `frontend/`:

```bash
npm install
npm run dev
```

Default frontend URL: `http://localhost:5173`

## API Overview

The frontend currently calls these backend routes:

- `GET/POST/PUT/DELETE /users`
- `GET/POST/PUT/DELETE /branches`
- `GET/POST/PUT/DELETE /timeslots`
- `GET/POST/PUT/DELETE /appointments`


