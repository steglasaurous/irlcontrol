FROM caddy:latest
RUN apk add gettext dos2unix bind-tools bash
COPY ./run.sh /run.sh
RUN dos2unix /run.sh && chmod +x /run.sh
# put CMD to do config replacement then start caddy
CMD ["/bin/bash", "/run.sh"]
