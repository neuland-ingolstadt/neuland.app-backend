# neuland.app-backend

GraphQL API for the neuland.app and Neuland Next app using Apollo Server and Bun.

### Getting Started

```bash
bun i
```

Set the necessary environment variables in a `.env.local` file.

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
-   `src/data/` - Contains the static data for the API.
-   `src/resolvers/` - Contains the resolvers for the API.
-   `src/schema/` - Contains the type definitions for the API.
-   `src/types/` - Contains the types for TypeScript.
-   `src/utils/` - Contains utility functions for the API.
