# Stage 1: Build React App
FROM node:18-slim AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Nginx alpine has a built-in feature to use templates for env var substitution
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV PORT=8080
