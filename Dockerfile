FROM nginx:alpine-slim AS prod

ARG DATE
ARG VERSION

LABEL org.opencontainers.image.authors="Nerivec"
LABEL org.opencontainers.image.title="Zigbee2MQTT WindFront"
LABEL org.opencontainers.image.description="Open Source frontend for Zigbee2MQTT"
LABEL org.opencontainers.image.url="https://github.com/Nerivec/zigbee2mqtt-windfront"
LABEL org.opencontainers.image.documentation="https://github.com/Nerivec/zigbee2mqtt-windfront/wiki"
LABEL org.opencontainers.image.source="https://github.com/Nerivec/zigbee2mqtt-windfront"
LABEL org.opencontainers.image.licenses="GPL-3.0-or-later"
LABEL org.opencontainers.image.created=${DATE}
LABEL org.opencontainers.image.version=${VERSION}

EXPOSE 80

COPY .docker/scripts/ /docker-entrypoint.d/
COPY .docker/nginx.conf /etc/nginx/

RUN chmod +x /docker-entrypoint.d/100-envsubst-on-app-envs.sh

COPY dist/ /usr/share/nginx/html/
