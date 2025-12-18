# Neuland App Backend

[![Status](https://status.neuland.ing/api/v1/endpoints/neuland-app_neuland-api/health/badge.svg)](https://status.neuland.ing)
[![Uptime](https://status.neuland.ing/api/v1/endpoints/neuland-app_neuland-api/uptimes/24h/badge.svg)](https://status.neuland.ing)

Neuland API uses **GraphQL** to provide a flexible and powerful API for Neuland Next and several other services like the Neuland website.

## API Documentation

The API documentation is available [here](https://api.neuland.app/).

An architecture overview can be found [here](https://neuland.app/docs/contribute/architecture).

### Endpoint

<https://api.neuland.app/graphql>

## System Status

The real-time system status is available at [status.neuland.ing](https://status.neuland.ing). Here you find information about the current status of the different services and APIs that Neuland Next depends on.

| Service          | Status                                                                                        | Uptime (24h)                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| THI API          | ![THI API Status](https://status.neuland.ing/api/v1/endpoints/neuland-app_thi-api/health/badge.svg)           | ![THI API Status](https://status.neuland.ing/api/v1/endpoints/neuland-app_thi-api/uptimes/24h/badge.svg)           |
| Neuland API      | ![Neuland API Status](https://status.neuland.ing/api/v1/endpoints/neuland-app_neuland-api/health/badge.svg)        | ![Neuland API Status](https://status.neuland.ing/api/v1/endpoints/neuland-app_neuland-api/uptimes/24h/badge.svg)        |
| Neuland API (dev)     | ![Neuland Next Status](https://status.neuland.ing/api/v1/endpoints/neuland-app_neuland-api-(beta)/health/badge.svg) | ![Neuland Next Status](https://status.neuland.ing/api/v1/endpoints/neuland-app_neuland-api-(beta)/uptimes/24h/badge.svg) |
| Neuland Next Web | ![Neuland API (Beta) Status](https://status.neuland.ing/api/v1/endpoints/neuland-app_neuland-next-web/health/badge.svg) | ![Neuland API (Beta) Status](https://status.neuland.ing/api/v1/endpoints/neuland-app_neuland-next-web/uptimes/24h/badge.svg) |

## Development

### Getting Started

```bash
bun i
```

Set the necessary environment variables in a `.env.local` file.
You can use the `.env.local.example` file as a template.

### Database Setup

For local development, you can quickly spin up a PostgreSQL database using Docker:

```bash
# Start the database only
docker compose up postgres -d
```

This will start a PostgreSQL container with the following configuration:

- **Host**: `localhost` (use `host.docker.internal` when connecting from inside Docker)
- **Port**: `5432`
- **Database**: `app`
- **Username**: `postgres`
- **Password**: `postgres`

#### Running Database Migrations

After starting the PostgreSQL container, you can run migrations to set up your database schema:

```bash
bun migrate
```

If you're making schema changes, you can generate new migrations:

```bash
bun db:generate
```

#### Database Connection Issues

- **When running the app locally**: In your `.env.local`, set `DB_HOST=localhost`
- **When running in Docker**: Set `DB_HOST=postgres` (service name) or `DB_HOST=host.docker.internal` (to access a database on your host machine)

#### Running the Full Stack

To start both the PostgreSQL database and the backend app:

```bash
docker compose up -d
```

### Start the Development Server

```bash
bun start
```

> [!TIP]
> Use `bun dev` to start the development server with hot reloading.

### Documentation and Playground

Use the interactive GraphQL Playground to explore the API and its documentation.

```bash
http://localhost:4000/
```

#### Project Structure

- `index.ts` - The entry point for the API.
- `src/` - Contains the source code for the GraphQL API.
- `src/schema.gql` - Contains the GraphQL schema.
- `src/data/` - Contains the static data.
- `src/resolvers/` - Contains the resolvers.
- `src/types/` - Contains the types for TypeScript.
- `src/scrapers/` - Contains the scrapers for the data used by the resolvers.
- `src/utils/` - Contains utility functions.

#### Commiting Changes

We use Biome to lint and test the code before it is committed.

To run the linter, run:

```bash
bun lint
```

To fix the linting errors, run:

```bash
bun fmt
```

### Documentation

The static documentation is generated using [Magicdoc](https://magidoc.js.org/introduction/welcome) at build time.
So, you don't need to worry about it as long as you follow the conventions and update the `magicdoc.mjs` file when adding new custom scalars to the schema.

To start the documentation server locally, run:

```bash
bun docs:dev
```
