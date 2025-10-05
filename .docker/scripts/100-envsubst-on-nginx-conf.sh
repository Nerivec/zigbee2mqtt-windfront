#!/bin/sh
# vim:sw=2:ts=2:sts=2:et

set -eu

LC_ALL=C
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# If NGINX_LOCAL_RESOLVERS is not set or is empty, assign it the default value of "127.0.0.11".
: "${NGINX_LOCAL_RESOLVERS:=127.0.0.11}"
export NGINX_LOCAL_RESOLVERS

# Substitute the variable in the template file and generate the final config.
# `envsubst` is a standard utility that substitutes environment variables in shell format strings.
envsubst '$NGINX_LOCAL_RESOLVERS' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
