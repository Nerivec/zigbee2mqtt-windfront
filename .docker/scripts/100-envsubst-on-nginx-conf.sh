#!/bin/sh
# vim:sw=2:ts=2:sts=2:et

set -eu

LC_ALL=C
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

[ "${NGINX_LOCAL_RESOLVERS:-}" ] || return 0

# Substitute the variable in the template file and generate the final config.
# `envsubst` is a standard utility that substitutes environment variables in shell format strings.
envsubst '$NGINX_LOCAL_RESOLVERS' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
