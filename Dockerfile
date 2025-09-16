FROM nginxinc/nginx-unprivileged:alpine-slim AS prod

ENV NGINX_PORT=80

EXPOSE 80

COPY --chmod=755 .docker/scripts/ /docker-entrypoint.d/
COPY --chown=nginx:root .docker/nginx.conf /etc/nginx/
COPY --chown=nginx:root dist/ /usr/share/nginx/html/
