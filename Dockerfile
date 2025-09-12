FROM nginxinc/nginx-unprivileged:alpine-slim AS prod

EXPOSE 8080

COPY --chmod=755 .docker/scripts/ /docker-entrypoint.d/
COPY --chown=nginx:root .docker/nginx.conf /etc/nginx/
COPY --chown=nginx:root dist/ /usr/share/nginx/html/
