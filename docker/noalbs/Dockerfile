FROM ubuntu:23.04
ENV DEBIAN_FRONTEND=noninteractive
ENV NOALBS_VERSION=v2.9.0
RUN apt-get update -y && apt-get upgrade -y && apt-get install -y wget gettext-base dos2unix
RUN wget https://github.com/715209/nginx-obs-automatic-low-bitrate-switching/releases/download/${NOALBS_VERSION}/noalbs-${NOALBS_VERSION}-x86_64-unknown-linux-musl.tar.gz && \
    tar zxvf noalbs-${NOALBS_VERSION}-x86_64-unknown-linux-musl.tar.gz && \
    mkdir -p /usr/local/noalbs && \
    cp noalbs-${NOALBS_VERSION}-x86_64-unknown-linux-musl/noalbs /usr/local/noalbs
COPY ./config.json /config.json
COPY ./run.sh /run.sh
RUN dos2unix /run.sh && chmod +x /run.sh
CMD ["/bin/bash", "/run.sh"]
