# Étape 1 : Build de l'application NestJS & Prisma
FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache openssl

# Copie des définitions de dépendances et du schéma Prisma
COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

# Copie du code source complet
COPY . .

# Génération du client Prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build du projet NestJS
RUN npm run build

# Étape 2 : Image de Production
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

# Copie des définitions et du schéma Prisma
COPY package*.json ./
COPY prisma ./prisma

# Installation des dépendances prod en ignorant les scripts postinstall automatiques
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copie des artefacts du build (code compilé, images initiales et client Prisma)
COPY --from=build /app/dist ./dist
COPY --from=build /app/uploads ./uploads
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

# Générer les fichiers d'exécutable client Prisma si nécessaire
RUN npx prisma generate --schema=./prisma/schema.prisma

# Assurer les permissions pour l'utilisateur node sur /app/uploads
RUN chown -R node:node /app/uploads


USER node

EXPOSE 3001

# Lancement des migrations Prisma, du script de données initiales (queries.js) et démarrage du serveur NestJS
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/queries.js && node dist/main.js"]


