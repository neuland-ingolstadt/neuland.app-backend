# neuland.app-backend

Neuland API uses GraphQL to provide a flexible and powerful API for neuland.app and Neuland Next.

## API Documentation

The API documentation is available [here](https://neuland-ingolstadt.github.io/neuland.app-backend/).

### Endpoint

https://api.neuland.app/graphql

> [!IMPORTANT]
> Using the provided API endpoint outside of the neuland.app and Neuland Next app is not allowed.

## Development

### Getting Started

```bash
bun i
```

Set the necessary environment variables in a `.env.local` file.
You can use the `.env.local.example` file as a template.

````bash

### Start the Development Server

```bash
bun start
````

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

When changing the schema file husky will automatically generate the html documentation. Therefore, you need to have the `spectaql` package installed globally.

```bash
npm install -g spectaql
```
