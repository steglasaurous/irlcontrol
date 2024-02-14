#!/usr/bin/env bash

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
