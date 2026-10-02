# Dockerfile

# 1. Etapa de Dependencias
FROM dockerhub.canalm.com.ar/node:25-alpine AS deps
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Instalar dependencias
RUN npm install

# 2. Etapa de Build
FROM dockerhub.canalm.com.ar/node:25-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Construir la aplicación
RUN npm run build

# 3. Etapa de Producción
FROM dockerhub.canalm.com.ar/node:25-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
#ENV PORT=9000

# Copiar los archivos de la build y los node_modules necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Exponer el puerto
EXPOSE $PORT

# Crear el directorio de logs
RUN mkdir -p /app/logs

# Comando para iniciar la aplicación en el puerto especificado
CMD sh -c "npm run start -- -p $PORT > /app/logs/app.log 2>&1"
