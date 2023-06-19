FROM node:18
ENV DEBIAN_FRONTEND=noninteractive

# Copy client and server into container for building
# RUN mkdir -p /server && mkdir -p /client
RUN apt-get -y update && apt-get -y upgrade && apt-get install -y gettext-base dos2unix
COPY client /client
COPY server /server

# Build the backend app
RUN cd /server && npm ci && npm run build
# Build the frontend app then place the output in a location available for the backend to serve
RUN cd /client && npm ci && npm run build && cp -R /client/dist/client/* /server/public
# Put run script in place (to do var substitutions before launching, then launching backend)
COPY docker/irlcontrol/run.sh /run.sh
RUN dos2unix /run.sh && chmod +x /run.sh
EXPOSE 3000
CMD ["/bin/bash", "/run.sh"]
