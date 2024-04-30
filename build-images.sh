#!/usr/bin/env bash
# This script builds docker images directly instead of via docker-compose.  This is useful for cases where
# you want to start the images rather than have the build managed by docker-compose to simplify managed production rollouts.

# irlcontrol
docker build . --tag localhost:5000/irlcontrol:latest

# noalbs
docker build docker/noalbs --tag localhost:5000/irlcontrol-noalbs:latest

# sls
docker build docker/sls --tag localhost:5000/irlcontrol-sls:latest

# Push everything.

docker push localhost:5000/irlcontrol:latest
docker push localhost:5000/irlcontrol-noalbs:latest
docker push localhost:5000/irlcontrol-sls:latest
