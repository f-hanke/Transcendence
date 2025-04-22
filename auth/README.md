# Pong User Management Service

This is a user management service for the ft_transcendence project. It handles user authentication, profile management, friend relationships, and match history tracking.

## Features

- User registration and authentication
- Profile management
- Avatar uploads
- Friend requests and friend management
- Match history recording and viewing
- User blocking

## Technologies

- Node.js
- Fastify
- SQLite
- Handlebars (for views)
- Docker & Docker Compose

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

## Running with Docker

1. Clone the repository
2. Navigate to the project directory
3. Add a default avatar image at `public/img/default-avatar.png`
4. Run the application using Docker Compose:

```bash
docker-compose up --build
```

The application will be available at http://localhost:3000

## Local Development

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Add a default avatar image at `public/img/default-avatar.png`
5. Run database migrations:

```bash
npm run migrate
```

6. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Project Structure

```
user-service/
├── config/           # Configuration variables
├── db/               # Database connection and migrations
├── models/           # Data models
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utility functions
├── public/           # Static assets
├── views/            # Handlebars templates
├── app.js            # Main application file
├── server.js         # Server entry point
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

## Database Schema

- **users**: User accounts and profile information
- **matches**: Match history and results
- **friendships**: Friend relationships between users
- **friend_requests**: Pending friend requests
- **blockings**: Blocked user relationships

## Future Enhancements

- Add support for profile customization
- Implement user activity tracking
- Add tournament management
- Enhance match history with more detailed statistics
- Implement real-time notifications
