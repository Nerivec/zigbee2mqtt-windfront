#!/usr/bin/env sh

# If NGINX_RESOLVER_ADDRESS variable is not defined, grab it from /etc/resolv.conf
if [ -z "$NGINX_RESOLVER_ADDRESS" ]; then
    export NGINX_RESOLVER_ADDRESS=$(awk '/nameserver/{a=(a?a" "$2:$2)} END{print a}' /etc/resolv.conf 2> /dev/null)
fi

# Output nameserver configuration for informational purposes
echo "Configured nameserver is: $NGINX_RESOLVER_ADDRESS"

echo "Manipulating nginx.conf template configuration with the gathered data"

# Substitute the NGINX_RESOLVER_ADDRESS placeholder of nginx.conf.template with the IP address of the DNS Resolver
envsubst '$NGINX_RESOLVER_ADDRESS' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
