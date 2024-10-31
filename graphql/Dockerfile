FROM oven/bun:1 AS base
WORKDIR /usr/src/graphql

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY graphql/package.json graphql/bun.lockb /temp/dev/
COPY patches /temp/dev/patches
RUN cd /temp/dev && bun install --frozen-lockfile --ignore-scripts

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY graphql/package.json graphql/bun.lockb /temp/prod/
COPY patches /temp/prod/patches
RUN cd /temp/prod && bun install --frozen-lockfile --production --ignore-scripts

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY graphql .

RUN bunx magidoc generate -f docs/magidoc.mjs 

# copy production dependencies and source code into final image
FROM base AS release
COPY --chown=bun:bun --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/graphql/docs/out docs/out
COPY --from=prerelease /usr/src/graphql/index.ts .
COPY --from=prerelease /usr/src/graphql/package.json .
COPY --from=prerelease /usr/src/graphql/tsconfig.json .
COPY --from=prerelease /usr/src/graphql/src src

# run the app
USER bun
EXPOSE 4000
ENTRYPOINT [ "bun", "run", "index.ts" ]