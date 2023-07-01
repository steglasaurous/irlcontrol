#!/usr/bin/env bash
if [ -z "$PUBLIC_IP" ]; then
  PUBLIC_IP=$(dig +short txt ch whoami.cloudflare @1.0.0.1)
  export PUBLIC_IP=${PUBLIC_IP//\"/}
fi
envsubst < /Caddyfile > /etc/caddy/Caddyfile
dos2unix /etc/caddy/Caddyfile
cat /etc/caddy/Caddyfile
caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
