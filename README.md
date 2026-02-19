# Zest India Products API

Full-stack REST API solution for Product management built with Java Spring Boot and React Vite.

---

## Architecture Overview

```
zest-products/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/zestindia/products/
│   │   │   │   ├── config/          # Security, CORS, Swagger, Async
│   │   │   │   ├── controller/      # AuthController, ProductController
│   │   │   │   ├── dto/             # Request and Response DTOs
│   │   │   │   ├── entity/          # User, Product, Item, RefreshToken
│   │   │   │   ├── exception/       # Global exception handling
│   │   │   │   ├── repository/      # JPA repositories
│   │   │   │   ├── security/        # JWT filter, provider, UserDetailsService
│   │   │   │   └── service/         # Business logic
│   │   │   └── resources/
│   │   │       ├── application.yml              # Local dev config
│   │   │       ├── application-production.yml   # Production config (Render)
│   │   │       └── application-test.yml         # Test config (H2)
│   │   └── test/                    # Unit + Integration tests
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/                     # Axios instance, auth, products API
│   │   ├── components/              # Layout, Sidebar, ProtectedRoute
│   │   ├── context/                 # AuthContext
│   │   ├── pages/                   # Login, Register, Dashboard, Products, ProductDetail
│   │   └── styles/                  # Global CSS variables and dark theme
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── push-to-dockerhub.sh
```

---

## Tech Stack

**Backend**
- Java 17
- Spring Boot 3.2
- Spring Data JPA + Hibernate
- PostgreSQL (production) / H2 (testing)
- Spring Security + JWT + Refresh Token rotation
- SpringDoc OpenAPI (Swagger UI)
- JUnit 5 + Mockito
- Docker

**Frontend**
- React 18 + Vite
- React Router v6
- Axios with request/response interceptors
- CSS Modules
- Lucide React icons
- React Hot Toast

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/refresh-token | Refresh access token |
| POST | /api/v1/auth/logout | Logout |

### Products
| Method | Endpoint | Auth Required | Role |
|--------|----------|---------------|------|
| GET | /api/v1/products | Yes | USER, ADMIN |
| GET | /api/v1/products/{id} | Yes | USER, ADMIN |
| POST | /api/v1/products | Yes | USER, ADMIN |
| PUT | /api/v1/products/{id} | Yes | USER, ADMIN |
| DELETE | /api/v1/products/{id} | Yes | ADMIN only |
| GET | /api/v1/products/{id}/items | Yes | USER, ADMIN |
| POST | /api/v1/products/{id}/items | Yes | USER, ADMIN |
| PUT | /api/v1/products/{id}/items/{itemId} | Yes | USER, ADMIN |
| DELETE | /api/v1/products/{id}/items/{itemId} | Yes | USER, ADMIN |

### Query Parameters for GET /api/v1/products
- `search` - Filter by name or creator
- `page` - Page number (default 0)
- `size` - Page size (default 10)
- `sortBy` - Sort field (default id)
- `sortDir` - asc or desc

---
## Spring Profiles

| Profile | Config File | Used When |
|---|---|---|
| default | `application.yml` | Local development |
| production | `application-production.yml` | Render.com deployment |
| test | `application-test.yml` | Running tests |

## Local Development Setup

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 14+ or Docker

### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/shiva-srivastav/zest-products.git
cd zest-products/backend
```

2. Create PostgreSQL database
```sql
CREATE DATABASE zestdb;
CREATE USER zestuser WITH PASSWORD 'zestpass';
GRANT ALL PRIVILEGES ON DATABASE zestdb TO zestuser;
```

3. Configure environment variables (or use defaults in application.yml)
```bash
export DB_URL=jdbc:mysql://localhost:3306/zestdb
export DB_USERNAME=zestuser
export DB_PASSWORD=zestpass
export JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

4. Run the backend
```bash
mvn spring-boot:run
```

Backend starts at http://localhost:8080
Production Backend URL: https://zest-products.onrender.com

Swagger UI: http://localhost:8080/swagger-ui.html
Swagger Production UI: https://zest-products.onrender.com/swagger-ui/index.html

actuator Production URL: https://zest-products.onrender.com/actuator/health
### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at http://localhost:5173
Production Frontend URL: https://zest-products-frontend.onrender.com/

---

## Docker Setup (Recommended)

Run the entire stack with one command:

```bash
docker-compose up --build
```

This starts:
- PostgreSQL on port 5432
- Spring Boot API on port 8080
- React frontend on port 3000

### Pushing Backend Image to Docker Hub

```bash
cd backend

# Build the image
docker build -t hacker123shiva/zest-products-backend:latest .

# Login to Docker Hub
docker login

# Push
docker push hacker123shiva/zest-products-backend:latest
```

---

## Running Tests

```bash
cd backend
mvn test
```

Tests use H2 in-memory database (no MySQL needed). Coverage includes:
- Unit tests for ProductService (ProductServiceTest)
- Integration/MVC tests for ProductController (ProductControllerTest)

---

## Production Deployment

### Architecture

```
GitHub Repo
├── backend/   →   Render.com   (Spring Boot API)
└── frontend/  →   Vercel/Render      (React Vite)
                       ↕
                   Aiven.io     (MySQL database)
```

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "your message"
git push origin main
```

### Step 2 — Deploy Spring Boot Backend on Render (Docker)

1. Go to **render.com** → **New** → **Web Service**
2. Connect your GitHub repository
3. Select:

| Field                          | Value                |
| ------------------------------ | -------------------- |
| Runtime                        | `Docker`             |
| Branch                         | `main`               |
| Root Directory                 | `backend`            |
| Dockerfile Path                | `backend/Dockerfile` |
| Docker Build Context Directory | `backend`            |
| Auto-Deploy                    | `On Commit`          |
| Instance Type                  | `Free`               |

4. Add Environment Variables (Render → Environment → Add):

| Key                      | Value                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `SPRING_PROFILES_ACTIVE` | `production`                                                                                 |
| `DB_URL`                 | `jdbc:mysql://YOUR_AIVEN_HOST:PORT/defaultdb?useSSL=true&requireSSL=true&serverTimezone=UTC` |
| `DB_USERNAME`            | `avnadmin`                                                                                   |
| `DB_PASSWORD`            | `your-aiven-password`                                                                        |
| `JWT_SECRET`             | `your-long-random-secret`                                                                    |

5. Set Health Check (Recommended)

Render → Settings → Health Checks:

| Field             | Value              |
| ----------------- | ------------------ |
| Health Check Path | `/actuator/health` |

6. Click **Create Web Service**

---

### Verify Deployment

After deploy, test:

* `https://zest-products.onrender.com/actuator/health` → should return `{"status":"UP"}`
* `https://zest-products.onrender.com/swagger-ui/index.html` → Swagger UI (Springdoc)

---

### Required Dockerfile (backend/Dockerfile)

Make sure you have a Dockerfile like this inside `backend/`:

```dockerfile
# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn -DskipTests clean package

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
```

### Step 3 — Deploy Frontend on Vercel

1. Go to **vercel.com** → Add New → Project
2. Import your GitHub repository
3. Set the following:

| Field | Value |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. Add Environment Variable:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://zest-products.onrender.com/` |

5. Click **Deploy**

---

## Environment Variables Reference

### Backend (Render.com)

| Variable | Required | Description |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Yes | Set to `production` |
| `DB_URL` | Yes | Full JDBC MySQL connection URL |
| `DB_USERNAME` | Yes | Database username |
| `DB_PASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `PORT` | No | Default 8080 |

### Frontend (Vercel)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend URL, no trailing slash |

## Free Hosting Options

### Backend — Railway.app (recommended)
1. Go to https://railway.app and sign in with GitHub
2. Click "New Project" -> "Deploy from GitHub repo"
3. Select your repository and set the root directory to `backend`
4. Add environment variables: DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET
5. Railway auto-detects the Dockerfile and deploys

### Backend — Render.com
1. Go to https://render.com
2. Create a new "Web Service"
3. Connect your GitHub repo, set root to `backend`


### Frontend — Vercel (recommended)
1. Go to https://vercel.com
2. Import your GitHub repository
3. Set root directory to `frontend`
4. Set environment variable: `VITE_API_BASE_URL=https://zest-products.onrender.com/`
5. Deploy

### Frontend — Netlify
1. Go to https://netlify.com
2. Connect GitHub, set base directory to `frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`

---

## Environment Variables

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| DB_URL | jdbc:mysql://localhost:3306/zestdb | JDBC connection string |
| DB_USERNAME | zestuser | Database username |
| DB_PASSWORD | zestpass | Database password |
| JWT_SECRET | (built-in) | JWT signing secret (change in production) |
| PORT | 8080 | Server port |

### Frontend
| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_BASE_URL | (empty = same origin) | Backend API base URL |

---

## Security Features

- JWT access tokens (1 hour expiry)
- Refresh token rotation (24 hour expiry)
- BCrypt password hashing
- Role-based access control (ROLE_USER, ROLE_ADMIN)
- Input validation using Jakarta Validation
- CORS configuration
- Stateless session management
- H2 console disabled in production

---

## Database Schema

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_roles (
  user_id BIGINT REFERENCES users(id),
  role VARCHAR(50)
);

CREATE TABLE product (
  id BIGSERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  created_by VARCHAR(100) NOT NULL,
  created_on TIMESTAMP NOT NULL,
  modified_by VARCHAR(100),
  modified_on TIMESTAMP
);

CREATE TABLE item (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES product(id),
  quantity INT NOT NULL
);

CREATE TABLE refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id BIGINT UNIQUE REFERENCES users(id),
  expiry_date TIMESTAMP NOT NULL
);
```
