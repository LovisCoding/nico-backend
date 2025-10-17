# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
# dépendances OS (prisma nécessite openssl)
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci
COPY . .
# génère le client Prisma et build Nest
RUN npx prisma generate
RUN npm run build

# --- production (slim) ---
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
# copier uniquement le minimum vital
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
# Entrypoint: applique les migrations en prod puis lance l’app
COPY --from=build /app/node_modules/.bin/prisma /usr/local/bin/prisma
USER node
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
