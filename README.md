# Zest India Products API

Full-stack REST API solution for Product management built with Java Spring Boot and React Vite.

---

## Architecture Overview

```
zest-products/
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/com/zestindia/products/
│   │   ├── config/             # Security, CORS, Swagger, Async, JPA
│   │   ├── controller/         # AuthController, ProductController
│   │   ├── dto/                # Request and Response DTOs
│   │   ├── entity/             # JPA entities (User, Product, Item, RefreshToken)
│   │   ├── exception/          # Global exception handling
│   │   ├── repository/         # Spring Data JPA repositories
│   │   ├── security/           # JWT provider, filter, UserDetailsService
│   │   └── service/            # Business logic layer
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                   # React Vite frontend
│   ├── src/
│   │   ├── api/                # Axios client with interceptors
│   │   ├── components/         # Layout, Sidebar, ProtectedRoute
│   │   ├── context/            # AuthContext with JWT management
│   │   └── pages/              # Login, Register, Dashboard, Products, ProductDetail
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
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

Swagger UI: http://localhost:8080/swagger-ui.html

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at http://localhost:5173

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
4. Set build command: `mvn clean package -DskipTests`
5. Set start command: `java -jar target/*.jar`
6. Add a PostgreSQL database add-on

### Frontend — Vercel (recommended)
1. Go to https://vercel.com
2. Import your GitHub repository
3. Set root directory to `frontend`
4. Set environment variable: `VITE_API_BASE_URL=https://your-backend-url`
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
