# Technical Implementation Constraints

## Database Implementation
- All persistent data storage must utilize SQLite as mandated by the project requirements.
- Each microservice maintains its own SQLite database instance, implementing database-per-service pattern to ensure service autonomy and loose coupling.
- This approach supports the bounded context principle of domain-driven design, where each microservice owns its domain-specific data.

## Backend Technology Stack
- All server-side components are implemented using Node.js runtime with Fastify as the web framework, conforming to the project's "Backend Framework" module requirements.
- Each microservice is developed as a discrete Node.js application with its own dependency management, configuration, and deployment pipeline.
- Inter-service communication is facilitated through a combination of synchronous HTTP requests via the API Gateway and asynchronous messaging via RabbitMQ.

## Architectural Implications
- The microservice architecture provides isolation at both the service and data levels, allowing independent scaling and deployment of individual components.
- Each service maintains exclusive write access to its database, avoiding data consistency issues that might arise from shared database access.
- The co-location of services with their respective databases minimizes latency for data operations while preserving the bounded context model.
