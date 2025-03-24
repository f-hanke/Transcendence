# User Management Service - Project Structure

```
user-service/
├── docker-compose.yml      # Docker configuration
├── Dockerfile              # For containerization
├── .env                    # Environment variables (not in git)
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── package.json            # Node.js dependencies and scripts
├── tsconfig.json           # TypeScript configuration
│
├── src/                    # Backend source code
│   ├── app.ts              # Main application entry point
│   ├── config/             # Configuration files
│   │   └── config.ts       # App configuration
│   │
│   ├── controllers/        # Request handlers
│   │   └── userController.ts  # User-related handlers
│   │
│   ├── db/                 # Database setup and migrations
│   │   ├── migrations/     # Database migrations
│   │   ├── schema.sql      # SQL schema
│   │   └── dbClient.ts     # Database client
│   │
│   ├── models/             # Data models
│   │   └── user.ts         # User model
│   │
│   ├── routes/             # API routes
│   │   └── userRoutes.ts   # User-related routes
│   │
│   ├── services/           # Business logic
│   │   └── userService.ts  # User-related services
│   │
│   ├── middleware/         # Custom middleware
│   │   ├── auth.ts         # Authentication middleware
│   │   └── validation.ts   # Request validation
│   │
│   └── utils/              # Utility functions
│       ├── passwordUtils.ts  # Password hashing, validation
│       └── fileUtils.ts     # File handling (for avatars)
│
└── public/                 # Frontend assets
    ├── css/                # Compiled CSS
    ├── js/                 # Compiled JavaScript
    ├── uploads/            # User uploaded avatars
    │   └── default.png     # Default avatar image
    │
    └── index.html          # Main HTML entry point
```

# User Management Service - Documentation

This is a standalone microservice for the "Standard user management, authentication and users across tournaments" module of the FT_Transcendence project.

## Features

- User registration and authentication
- JWT-based authentication
- User profiles with avatars
- Match history tracking
- Friend system with friend requests
- User blocking functionality
- Responsive UI for testing the API

## Tech Stack

- **Backend**: Node.js with Fastify
- **Database**: SQLite
- **Frontend**: TypeScript with Tailwind CSS
- **Authentication**: JWT tokens
- **Password Security**: Bcrypt hashing

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd auth
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp env-example.txt .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The server will be running at `http://localhost:3001`

### Docker Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd user-management-service
   ```

2. Build and start the Docker container:
   ```bash
   docker-compose up -d
   ```

3. The server will be running at `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login
- `POST /api/users/logout` - Logout (requires authentication)

### User Profile

- `GET /api/users/me` - Get current user profile
- `POST /api/users/me/avatar` - Update avatar
- `PUT /api/users/me/display-name` - Update display name
- `GET /api/users/:id` - Get user by ID

### Friends

- `GET /api/users/me/friends` - Get friends
- `POST /api/users/friend-requests` - Send friend request
- `PUT /api/users/friend-requests/respond` - Respond to friend request
- `GET /api/users/friend-requests/pending` - Get pending friend requests
- `DELETE /api/users/friends` - Remove friend

### Blocking

- `POST /api/users/blocks` - Block user
- `DELETE /api/users/blocks` - Unblock user
- `GET /api/users/blocks` - Get blocked users

### Matches

- `GET /api/users/me/matches` - Get match history
- `POST /api/users/matches` - Record a match

## API Request/Response Examples

### Register User

**Request:**
```json
POST /api/users/register
{
  "email": "user@example.com",
  "password": "password123",
  "display_name": "player1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "player1",
    "image": "default.png",
    "login_count": 0,
    "online_status": 0,
    "created_at": "2023-06-15T14:30:00.000Z"
  },
  "token": "jwt_token_here"
}
```

### Login

**Request:**
```json
POST /api/users/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "player1",
    "image": "default.png",
    "login_count": 1,
    "online_status": 1,
    "created_at": "2023-06-15T14:30:00.000Z"
  },
  "token": "jwt_token_here"
}
```

### Get User Profile

**Request:**
```
GET /api/users/me
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "player1",
    "image": "default.png",
    "login_count": 1,
    "online_status": 1,
    "created_at": "2023-06-15T14:30:00.000Z",
    "wins": 5,
    "losses": 3,
    "friends_count": 2
  }
}
```

## Database Schema

The SQLite database includes the following tables:

- **users**: Stores user information including credentials and profile data
- **matches**: Records match results between users
- **friendships**: Tracks friend relationships between users
- **friend_requests**: Manages pending friend requests
- **blockings**: Stores user blocking information

## Frontend

The frontend is a simple single-page application built with TypeScript and Tailwind CSS. It provides a user interface to test the API functionality, including:

- Login and registration forms
- Profile management
- Friend request system
- Match history display

## Integration with FT_Transcendence

To integrate this microservice with the main FT_Transcendence project:

1. Ensure the API Gateway is configured to route `/api/users/*` requests to this service
2. Implement JWT validation across services
3. Set up inter-service communication for user-related events

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Input validation is implemented for all form submissions
- Upload file size and type are restricted for avatars
