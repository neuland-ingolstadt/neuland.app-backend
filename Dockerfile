FROM imbios/bun-node AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile --ignore-scripts

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production --ignore-scripts

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# build the docs using npx (magidoc does not support bunx yet)
RUN npx @magidoc/cli@latest generate -f docs/magidoc.mjs


# copy production dependencies and source code into final image
FROM base AS release
COPY --chown=bun:bun --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/docs/out docs/out
COPY --from=prerelease /usr/src/app/index.ts .
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/tsconfig.json .
COPY --from=prerelease /usr/src/app/src src

# run the app
USER bun
EXPOSE 4000
ENTRYPOINT [ "bun", "run", "index.ts" ]