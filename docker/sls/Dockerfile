FROM b3ckontwitch/sls-b3ck-edit
USER root
COPY run.sh /run.sh
RUN apk add dos2unix && chmod +x /run.sh && dos2unix /run.sh
USER srt
ENTRYPOINT ["/bin/sh", "/run.sh"]
