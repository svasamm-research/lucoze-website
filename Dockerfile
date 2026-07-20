FROM node:22-slim AS build

# Environment-specific URLs — set via --build-arg per environment
# UAT:  PUBLIC_BILLING_API_URL=https://admin-uat.lucoze.com
# Prod: PUBLIC_BILLING_API_URL=https://admin.lucoze.com
ARG PUBLIC_BILLING_API_URL=""
ENV PUBLIC_BILLING_API_URL=${PUBLIC_BILLING_API_URL}

# Admin API base for the signup → provisioning flow. MUST be set at build
# time (Astro inlines PUBLIC_* into the static bundle); unset = the signup
# form stays in pre-launch mode and never submits.
# UAT:  PUBLIC_ADMIN_API_URL=https://admin-uat.lucoze.com
# Prod: PUBLIC_ADMIN_API_URL=https://admin.lucoze.com
ARG PUBLIC_ADMIN_API_URL=""
ENV PUBLIC_ADMIN_API_URL=${PUBLIC_ADMIN_API_URL}

# Plausible domain. Empty on UAT (skips Plausible loading entirely) so UAT traffic
# does not pollute production analytics. Set to "lucoze.com" for production builds.
ARG PUBLIC_PLAUSIBLE_DOMAIN=""
ENV PUBLIC_PLAUSIBLE_DOMAIN=${PUBLIC_PLAUSIBLE_DOMAIN}

# GA4 measurement ID. Like the vars above this MUST be a BUILD ARG — Astro inlines
# PUBLIC_* into the static bundle, so setting it only as a runtime env leaves the
# gtag block unrendered and GA reports "no data collected". Empty on UAT/local so
# they stay out of the production property.
# Prod: PUBLIC_GA_ID=G-8PKQ5SH09G
ARG PUBLIC_GA_ID=""
ENV PUBLIC_GA_ID=${PUBLIC_GA_ID}

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
