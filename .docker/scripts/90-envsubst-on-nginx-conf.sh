#!/usr/bin/env sh

set -ex

config_file="/etc/nginx/nginx.conf"

tmpfile=$(mktemp)
envsubst '${NGINX_PORT}' < "$config_file" > "$tmpfile"
mv "$tmpfile" "$config_file"
