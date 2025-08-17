FROM nginx:alpine-slim AS prod

EXPOSE 80

COPY .docker/scripts/ /docker-entrypoint.d/
COPY .docker/nginx.conf /etc/nginx/

RUN chmod +x /docker-entrypoint.d/100-envsubst-on-app-envs.sh

COPY dist/ /usr/share/nginx/html/
