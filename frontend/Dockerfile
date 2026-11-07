FROM node:24-slim

WORKDIR /app
# The dev server writes its dependency cache under node_modules, so the runtime user owns /app.
RUN chown node:node /app
USER node

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

COPY --chown=node:node . .

# No CMD: compose supplies the command, because the port comes from FRONTEND_PORT.
