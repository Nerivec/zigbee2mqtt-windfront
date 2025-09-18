#!/usr/bin/env sh

# Exit immediately if a command fails (-e)
# Treat unset variables as an error (-u)
set -eu

# Check if NGINX_RESOLVER_ADDRESS is already set.
# Using ${VAR:-} provides a default (empty string) to avoid
# an error if 'set -u' is active and the variable is unbound.
if [ -z "${NGINX_RESOLVER_ADDRESS:-}" ]; then
    echo "NGINX_RESOLVER_ADDRESS not set, parsing /etc/resolv.conf for IPv4..."

    # Run awk to find IPv4 nameservers
    RESOLVERS=$(awk '
        # Match lines starting with "nameserver" and a basic IPv4 pattern
        $1 == "nameserver" && $2 ~ /^([0-9]{1,3}\.){3}[0-9]{1,3}$/ {
            # Validate each octet is <= 255
            split($2, octets, ".")
            valid=1
            for (i=1; i<=4; i++) {
                if (octets[i] > 255) {
                    valid=0
                    break # Exit loop as soon as an invalid octet is found
                }
            }
            if (valid) { a=(a?a" "$2:$2) } # Add valid IPv4 to list
        }
        END{print a}
    ' /etc/resolv.conf 2> /dev/null) # Suppress errors if file not found

    # Check if awk found any valid resolvers
    if [ -z "$RESOLVERS" ]; then
        echo "Warning: No valid IPv4 nameserver entries found in /etc/resolv.conf" >&2
        # If no nameserver is found, configure the default docker nameserver
        export NGINX_RESOLVER_ADDRESS="127.0.0.11"
    else
        # If resolvers were found, export them
        export NGINX_RESOLVER_ADDRESS="$RESOLVERS"
    fi
else
    echo "Using existing NGINX_RESOLVER_ADDRESS."
fi

# Output nameserver configuration for informational purposes
echo "Configured nameserver is: $NGINX_RESOLVER_ADDRESS"

echo "Manipulating nginx.conf template configuration with the gathered data"

# Substitute the NGX_DNS_RESOLVER placeholder of nginx.conf.template with the IP address of the DNS Resolver
envsubst '$NGINX_RESOLVER_ADDRESS' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
