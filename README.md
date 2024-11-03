# Neuland App Backend

[![Uptime](https://status.neuland.app/api/badge/6/uptime/24)](https://status.neuland.app)
[![Uptime](https://status.neuland.app/api/badge/6/avg-response/24)](https://status.neuland.app)

Neuland API uses **GraphQL** to provide a flexible and powerful API for neuland.app and Neuland Next.

## Monorepo

This repository is a monorepo that contains the following packages:

- [neuland-app-graphql](/graphql) - The GraphQL API for neuland.app and Neuland Next.
- [neuland-app-scraper](/scraper) - The scrapers for the data used by some resolvers in the GraphQL API.

We use Bun workspace to manage the monorepo. To install the dependencies of all packages, run the following command in the root directory:

```bash
bun install
```

> [!TIP]
> Check the README of each package for more information.

## API Documentation

The API documentation is available [here](https://api.neuland.app/).

## Endpoint

https://api.neuland.app/graphql
```
