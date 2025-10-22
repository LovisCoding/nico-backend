# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl

# 1️⃣ Installer les dépendances
COPY package*.json ./
RUN npm ci

# 2️⃣ Copier le code source et le schéma Prisma
COPY . .
COPY prisma ./prisma

# 3️⃣ Générer le client Prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# 4️⃣ Builder ton app NestJS
RUN npm run build

# --- production ---
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# 5️⃣ Installer les dépendances prod
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/prisma ./prisma
RUN npx prisma generate --schema=./prisma/schema.prisma
# 6️⃣ Copier les fichiers nécessaires
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.bin/prisma /usr/local/bin/prisma

# 7️⃣ Lancer Prisma + ton app
USER node
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/main.js"]
