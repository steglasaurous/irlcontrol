#!/bin/sh
cp /sls.conf /etc/sls/sls.conf
dos2unix /etc/sls/sls.conf
sls -c /etc/sls/sls.conf
