# ==========================================
# Multi-stage Build para o Frontend Euditoria
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# ==========================================
# Servidor Web Leve e Otimizado (Nginx)
# ==========================================
FROM nginx:1.27-alpine

# Remove configuração padrão do Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copia configuração customizada com proxy reverso e headers de segurança
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os artefatos compilados do React
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]