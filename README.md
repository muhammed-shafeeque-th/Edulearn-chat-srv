# Chat Service

The **Chat Service** is the real-time communication service of the Edulearn platform. It provides persistent messaging, conversation management, real-time delivery, and event-driven communication between students, instructors, and platform participants.

The service is built with **NestJS**, **TypeScript**, **WebSockets**, **gRPC**, and **Clean Architecture**, and depends on **@edulearn/nest** for shared platform infrastructure including logging, metrics, distributed tracing, Redis, Kafka, health checks, and observability utilities.

---

## Overview

The Chat Service is the authoritative owner of messaging and conversation data within the platform. It manages conversations, message persistence, read receipts, presence events, and real-time delivery while coordinating with other services through **WebSockets**, **gRPC**, and **Kafka**.

### Responsibilities

* Real-time messaging
* Conversation management
* Message persistence
* Read receipts
* Typing indicators
* Online presence
* Message delivery acknowledgements
* Event-driven synchronization
* WebSocket connection management

### Out of Scope

* Authentication and authorization (Auth Service)
* User profile management (User Service)
* Course management (Course Service)
* Payment processing (Payment Service)
* Notification delivery (Notification Service)

---

# Architecture

This service follows **Clean Architecture (Hexagonal Architecture)** with **SOLID principles**, enabling framework-independent business logic, scalable real-time communication, and reliable message processing.

## Layered Architecture

```text
          WebSocket Gateway / gRPC Controllers
                        │
                Application Layer
      (Use Cases / DTOs / Events / Messaging)
                        │
                  Domain Layer
(Conversations / Messages / Repository Interfaces)
                        │
              Infrastructure Layer
 (MongoDB / Redis / Kafka / WebSockets / Observability)
```

### Layers

#### Presentation Layer

* WebSocket gateways
* gRPC controllers
* Connection lifecycle
* Authentication middleware
* Transport-specific concerns

#### Application Layer

* Messaging workflows
* Conversation orchestration
* Presence management
* Typing events
* Event handlers
* Delivery coordination

#### Domain Layer

* Conversation aggregate
* Message entity
* Participant entity
* Repository interfaces
* Domain services
* Messaging rules

#### Infrastructure Layer

* MongoDB persistence
* Redis pub/sub
* Kafka integration
* WebSocket infrastructure
* Logging, metrics, and tracing

---

# Technology Stack

| Category       | Technology                                          |
| -------------- | --------------------------------------------------- |
| Language       | TypeScript 5.x                                      |
| Runtime        | Node.js                                             |
| Framework      | NestJS 11                                           |
| Architecture   | Clean Architecture                                  |
| Transport      | gRPC                                                |
| Realtime       | WebSocket                                           |
| Database       | MongoDB                                             |
| ODM            | Mongoose                                            |
| Cache / PubSub | Redis                                               |
| Messaging      | Kafka                                               |
| Observability  | @edulearn/nest (Winston, Prometheus, OpenTelemetry) |
| Deployment     | Docker, Kubernetes, Helm                            |

---

# Core Domain

The Chat Service owns the communication domain.

## Conversation

* Conversation lifecycle
* Participants
* Conversation metadata
* Conversation state

## Message

* Message content
* Sender
* Attachments
* Delivery status
* Timestamps

## Participant

* User membership
* Conversation permissions
* Read state
* Presence information

## Presence

* Online / offline state
* Last seen
* Typing indicators
* Connection metadata

---

# Real-Time Messaging Flow

## Message Delivery

```text
Client A
   │
   ▼
WebSocket Gateway
   │
   ▼
Validate & Persist Message
   │
   ▼
MongoDB
   │
   ▼
Redis Pub/Sub
   │
   ▼
Connected Recipients
   │
   ▼
Client B
```

## Presence Updates

```text
Client Connect
      │
      ▼
Authenticate Socket
      │
      ▼
Update Presence
      │
      ▼
Broadcast Presence Event
      │
      ▼
Connected Participants
```

---

# Project Structure

```text
src/
├── application/
│   ├── dtos/
│   ├── use-cases/
│   ├── events/
│   └── services/
├── domain/
│   ├── entities/
│   ├── repositories/
│   ├── services/
│   └── exceptions/
├── infrastructure/
│   ├── database/
│   ├── websocket/
│   ├── grpc/
│   ├── kafka/
│   ├── redis/
│   ├── observability/
│   └── config/
├── presentation/
│   ├── websocket/
│   └── grpc/
└── shared/
```

---

# Communication

## WebSocket API

The Chat Service provides real-time communication through WebSocket gateways.

### Client Events

* `conversation.join`
* `conversation.leave`
* `message.send`
* `message.read`
* `typing.start`
* `typing.stop`
* `presence.subscribe`

### Server Events

* `message.created`
* `message.updated`
* `message.deleted`
* `message.read`
* `typing.started`
* `typing.stopped`
* `presence.updated`
* `conversation.updated`

---

## gRPC APIs

The Chat Service exposes internal gRPC APIs consumed by:

* API Gateway
* User Service
* Notification Service
* Course Service

Example operations:

* CreateConversation
* GetConversation
* GetConversationsByUser
* SendMessage
* GetMessages
* MarkMessageRead
* GetUnreadCount

---

## Kafka Integration

The Chat Service participates in the platform event architecture.

### Published Events

| Topic                        | Purpose              |
| ---------------------------- | -------------------- |
| chat.message.created.v1      | New message          |
| chat.message.read.v1         | Message read         |
| chat.conversation.created.v1 | Conversation created |
| chat.presence.updated.v1     | Presence updated     |

### Consumed Events

| Topic                        | Purpose                   |
| ---------------------------- | ------------------------- |
| user.updated.v1              | Synchronize user metadata |
| user.blocked.v1              | Restrict messaging        |
| user.unblocked.v1            | Restore messaging         |
| notification.request.chat.v1 | Trigger notifications     |

This event-driven model enables asynchronous notifications, analytics, and cross-service synchronization.

---

# Data Ownership

The Chat Service is the single source of truth for messaging-related data.

| Entity        | Owner        |
| ------------- | ------------ |
| conversations | Chat Service |
| messages      | Chat Service |
| participants  | Chat Service |
| presence      | Chat Service |

Other services access this data through gRPC APIs or Kafka events rather than direct database access.

---

# Dependency on @edulearn/nest

The Chat Service relies on **@edulearn/nest** for shared platform infrastructure.

## Logging

* Winston structured logging
* JSON log output
* Correlation IDs
* Trace-aware logging
* WebSocket connection diagnostics

## Metrics

Prometheus metrics include:

* Active WebSocket connections
* Messages sent
* Messages delivered
* Messages read
* Conversation creation rate
* Presence updates
* gRPC request latency
* Kafka consumer lag

Exposed at:

```text
/metrics
```

## Distributed Tracing

OpenTelemetry instrumentation provides end-to-end tracing across messaging workflows.

Trace flow:

```text
Client
   │
   ▼
API Gateway
   │
   ▼
Chat Service
   │
   ▼
MongoDB / Redis / Kafka
```

Traces are exported to **OTEL Collector → Tempo → Grafana**.

## Shared Infrastructure

Provided by **@edulearn/nest**:

* Logger
* Metrics registry
* Tracer
* Redis client
* Health checks
* Configuration utilities
* Common error handling

---

# Redis Usage

Redis is used for:

* WebSocket pub/sub
* Presence state
* Typing indicators
* Connection tracking
* Distributed gateway coordination
* Horizontal scaling support

Redis enables real-time communication across multiple Chat Service instances in a Kubernetes environment.

---

# Database

MongoDB is the primary persistent datastore.

Mongoose manages:

* Conversation documents
* Message documents
* Indexes
* Aggregation queries
* Repository implementations

Example collections:

* conversations
* messages
* participants
* presence

---

# Local Development

## Prerequisites

* Node.js 22+
* Yarn
* MongoDB
* Redis
* Kafka

## Install

```bash
yarn install
```

## Start Development

```bash
yarn start:dev
```

## Build

```bash
yarn build
```

## Start Production

```bash
yarn start:prod
```

---

# Environment Variables

| Variable                    | Description                     |
| --------------------------- | ------------------------------- |
| PORT                        | WebSocket / gRPC port           |
| MONGODB_URI                 | MongoDB connection string       |
| REDIS_URL                   | Redis connection string         |
| KAFKA_BROKERS               | Kafka broker list               |
| JWT_SECRET                  | WebSocket authentication secret |
| OTEL_EXPORTER_OTLP_ENDPOINT | OTLP collector endpoint         |
| LOG_LEVEL                   | Logging level                   |

See `env.example` for the complete configuration.

---

# Docker

The service uses a **multi-stage Docker build** optimized for production.

Optimizations include:

* Multi-stage compilation
* Dependency pruning
* Layer caching
* Minimal runtime image
* Non-root execution
* Reduced attack surface

---

# Kubernetes Deployment

Deployment is managed through the **Edulearn umbrella Helm chart**.

The service is deployed with:

* ClusterIP service
* WebSocket support
* gRPC exposure
* Liveness probes
* Readiness probes
* Resource requests and limits
* Horizontal Pod Autoscaler support
* Prometheus ServiceMonitor

For horizontal scaling, WebSocket instances coordinate through **Redis Pub/Sub**.

---

# CI/CD

This service participates in the platform GitOps deployment pipeline.

```text
Git Push
    │
    ▼
GitHub Actions
    ├── Test
    ├── Build
    ├── Lint
    ├── Trivy Scan
    └── Push to GHCR
             │
             ▼
ArgoCD Image Updater
             │
             ▼
ArgoCD
             │
             ▼
Amazon EKS
```

---

# Performance Optimizations

Implemented optimizations include:

* Redis Pub/Sub for horizontal scaling
* MongoDB indexing
* Efficient aggregation queries
* Connection pooling
* WebSocket connection reuse
* Kafka asynchronous processing
* Optimized Docker image size

---

# Security

The service follows production-oriented security practices.

## Messaging Security

* JWT-based WebSocket authentication
* Conversation membership validation
* Message authorization
* Rate limiting
* Input validation
* Attachment validation

## Secrets Management

Production deployments retrieve secrets from:

* AWS Secrets Manager
* External Secrets Operator

## Container Security

* Runs as non-root user
* No shell access
* Minimal Linux capabilities
* Read-only filesystem where applicable

---

# Testing

```bash
# Unit tests
yarn test

# Integration tests
yarn test:integration

# End-to-end tests
yarn test:e2e

# Coverage
yarn test:cov
```

---


# Related Repositories

| Repository                    | Description                                                   |
| ----------------------------- | ------------------------------------------------------------- |
| [edulearn-platform](https://github.com/muhammed-shafeeque-th/edulearn-platform)             | Platform orchestration repository                             |
| [edulearn-api-gateway](https://github.com/muhammed-shafeeque-th/edulearn-api-gateawy)          | API Gateway                                                   |
| [edulearn-user-service](https://github.com/muhammed-shafeeque-th/edulearn-user-srv)         | User profile service                                          |
| [edulearn-course-service](https://github.com/muhammed-shafeeque-th/edulearn-course-srv)       | Course management service                                     |
| [edulearn-payment-service](https://github.com/muhammed-shafeeque-th/edulearn-payment-srv)      | Payment processing service                                    |
| [edulearn-order-service](https://github.com/muhammed-shafeeque-th/edulearn-order-srv)        | Order management service                                      |
| [edulearn-notification-service](https://github.com/muhammed-shafeeque-th/edulearn-notification-srv) | Notification service                                          |
| [edulearn-auth-service](https://github.com/muhammed-shafeeque-th/edulearn-auth-srv)         | Authentication service                                        |
| [@edulearn/core](https://github.com/muhammed-shafeeque-th/edulearn-core)                | Shared logging, metrics, tracing, Redis, Kafka, health checks |
| [@edulearn/nest](https://github.com/muhammed-shafeeque-th/edulearn-nest)                | Shared NestJS infrastructure package                          |

---

# License

This project is part of the **Edulearn Platform** and is licensed under the MIT License.
