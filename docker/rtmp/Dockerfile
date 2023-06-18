FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive
ENV NGINX_VERSION=1.21.6
RUN apt-get update && apt-get -y upgrade && apt-get -y install build-essential libpcre3 libpcre3-dev libssl-dev zlib1g-dev unzip ffmpeg wget gettext-base curl procps file git jq detox sudo
RUN wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz \
    && wget https://github.com/sergey-dryabzhinsky/nginx-rtmp-module/archive/dev.zip \
    && tar zxvf nginx-${NGINX_VERSION}.tar.gz \
    && unzip dev.zip \
    && cd nginx-${NGINX_VERSION} \
    && ./configure --with-http_ssl_module --add-module=../nginx-rtmp-module-dev \
    && make \
    && make install

COPY nginx.conf.template /usr/local/nginx/conf/nginx.conf.template
COPY run.sh /run.sh
COPY stat.xsl /usr/local/nginx/html/stat.xsl

RUN chmod +x /run.sh && useradd -m www

EXPOSE 8090
EXPOSE 1935

CMD ["/run.sh"]

