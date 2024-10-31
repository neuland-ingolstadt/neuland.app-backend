# Neuland App Backend

[![Uptime](https://status.neuland.app/api/badge/6/uptime/24)](https://status.neuland.app)
[![Uptime](https://status.neuland.app/api/badge/6/avg-response/24)](https://status.neuland.app)

Neuland API uses **GraphQL** to provide a flexible and powerful API for neuland.app and Neuland Next.

## API Documentation

The API documentation is available [here](https://api.neuland.app/).

### Endpoint

https://api.neuland.app/graphql

## Development

### Getting Started

```bash
bun i
```

Set the necessary environment variables in a `.env.local` file.
You can use the `.env.local.example` file as a template.

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

-   `index.ts` - The entry point for the API.
-   `src/` - Contains the source code for the GraphQL API.
-   `src/schema.gql` - Contains the GraphQL schema.
-   `src/data/` - Contains the static data.
-   `src/resolvers/` - Contains the resolvers.
-   `src/types/` - Contains the types for TypeScript.
-   `src/scrapers/` - Contains the scrapers for the data used by the resolvers.
-   `src/utils/` - Contains utility functions.

#### Commiting Changes

We use husky to lint and test the code before it is committed, that's why we recommend using the ESLint and Prettier extensions in VSCode.

### Documentation

The static documentation is generated using [Magicdoc](https://magidoc.js.org/introduction/welcome) at build time.
So, you don't need to worry about it as long as you follow the conventions and update the `magicdoc.mjs` file when adding new custom scalars to the schema.

To start the documentation server locally, run:

```bash
bun docs:dev
```
