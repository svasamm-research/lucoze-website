FROM node:22-slim AS build

# Environment-specific URLs — set via --build-arg per environment
# UAT:  PUBLIC_BILLING_API_URL=https://admin-uat.lucoze.com
# Prod: PUBLIC_BILLING_API_URL=https://admin.lucoze.com
ARG PUBLIC_BILLING_API_URL=""
ENV PUBLIC_BILLING_API_URL=${PUBLIC_BILLING_API_URL}

# Plausible domain. Empty on UAT (skips Plausible loading entirely) so UAT traffic
# does not pollute production analytics. Set to "lucoze.com" for production builds.
ARG PUBLIC_PLAUSIBLE_DOMAIN=""
ENV PUBLIC_PLAUSIBLE_DOMAIN=${PUBLIC_PLAUSIBLE_DOMAIN}

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx alpine runs as nginx user by default on port 80
# For non-root, we adjust ownership and run on unprivileged port
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid
USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# NOTE: Use --read-only flag in docker-compose for additional security
CMD ["nginx", "-g", "daemon off;"]
