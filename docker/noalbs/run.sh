#!/bin/bash
printf "TWITCH_BOT_USERNAME=%s\nTWITCH_BOT_OAUTH=%s" $TWITCH_BOT_USERNAME $TWITCH_BOT_OAUTH > /usr/local/noalbs/.env
# Do a env substitution and place the result where the config is expected.
envsubst < /config.json > /usr/local/noalbs/config.json
cd /usr/local/noalbs && ./noalbs
