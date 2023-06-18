#!/bin/bash
# Read the ENV file and make appropriate config substitutions prior to running.
# twitch channel
envsubst < /config.json > /server/config.json
cd /server && npm run start
