FROM nginx:alpine-slim AS prod

# Set to Docker default in case NGINX_ENTRYPOINT_LOCAL_RESOLVERS is not set
ENV NGINX_LOCAL_RESOLVERS=127.0.0.11
EXPOSE 80

COPY .docker/scripts/ /docker-entrypoint.d/
COPY .docker/nginx.conf /etc/nginx/
COPY .docker/resolver.conf.template /etc/nginx/templates/

RUN chmod +x /docker-entrypoint.d/100-envsubst-on-app-envs.sh

COPY dist/ /usr/share/nginx/html/
