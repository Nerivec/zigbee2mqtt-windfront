#!/usr/bin/env sh

# If NGX_DNS_RESOLVER variable is not defined, grab it from /etc/resolv.conf
if [ "$NGX_DNS_RESOLVER" == "" ]; then
    export NGX_DNS_RESOLVER=$(awk '/nameserver/{a=(a?a" "$2:$2)} END{print a}' /etc/resolv.conf 2> /dev/null)
fi

echo "Configured nameserver is: $NGX_DNS_RESOLVER"

echo "Manipulating nginx.conf template configuration with the gathered data"

# Substitute the NGX_DNS_RESOLVER placeholder of nginx.conf.template with the IP address of the DNS Resolver
envsubst '$NGX_DNS_RESOLVER' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

cat /etc/nginx/nginx.conf
