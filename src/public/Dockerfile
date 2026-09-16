# ==========================================
# Multi-stage Build para o Frontend React
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Aproveita o cache do Docker copiando apenas os manifestos primeiro
COPY package.json package-lock.json* ./
RUN npm ci

# Copia o código-fonte e gera o build de produção
COPY . .
RUN npm run build

# ==========================================
# Servidor Web Leve e Otimizado (Nginx)
# ==========================================
FROM nginx:1.27-alpine

# Remove a configuração padrão
RUN rm -rf /etc/nginx/conf.d/*

# Copia configuração customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os artefatos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]