###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:20-alpine As development

# Create app directory
WORKDIR /usr/src/app
RUN mkdir -p /usr/src/app/server && mkdir -p /usr/src/app/client

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node server/package*.json ./server
COPY --chown=node:node client/package*.json ./client

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN cd server && npm ci && cd ../client && npm ci

# Bundle app source
COPY --chown=node:node ./server ./server
COPY --chown=node:node ./client ./client

# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:20-alpine As build

WORKDIR /usr/src/app
RUN apk add make
RUN mkdir -p /usr/src/app/server && mkdir -p /usr/src/app/client

COPY --chown=node:node server/package*.json ./server
COPY --chown=node:node client/package*.json ./client

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --chown=node:node --from=development /usr/src/app/server/node_modules ./node_modules
COPY --chown=node:node --from=development /usr/src/app/client/node_modules ./node_modules

COPY --chown=node:node ./server ./server
COPY --chown=node:node ./client ./client
COPY --chown=node:node ./Makefile ./Makefile

# Run the build command which creates the production bundle
RUN make build-prod
#RUN cd server && npx nest build --builder=webpack && NODE_ENV=production npm ci --only=production && cd ..
#RUN cd client && npx ng build -c production && cd ..

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN cd server && npm cache clean --force && cd ..
RUN cd client && npm cache clean --force && cd ..

USER node

###################
# PRODUCTION
###################

FROM node:20-alpine as production
ENV DEBIAN_FRONTEND=noninteractive

# Copy client and server into container for building
RUN mkdir -p /server && mkdir -p /server/public
RUN apk update && apk upgrade && apk add gettext dos2unix
COPY --chown=node:node --from=build /usr/src/app/server/node_modules /server/node_modules
COPY --chown=node:node --from=build /usr/src/app/server/dist /server
COPY --chown=node:node --from=build /usr/src/app/client/dist/client /server/public
COPY docker/irlcontrol/config.json /config.json

# Put run script in place (to do var substitutions before launching, then launching backend)
COPY docker/irlcontrol/run.sh /run.sh
RUN dos2unix /run.sh && chmod +x /run.sh
EXPOSE 3000
CMD ["/bin/bash", "/run.sh"]
