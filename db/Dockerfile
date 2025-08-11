FROM postgres:15

USER root

RUN apt-get update && apt-get install -y locales \
 && sed -i '/th_TH.UTF-8 UTF-8/s/^# //' /etc/locale.gen \
 && locale-gen th_TH.UTF-8

# Use locale name recognized by Debian/Postgres
ENV LANG=th_TH.utf8
ENV LANGUAGE=th_TH:th
ENV LC_ALL=th_TH.utf8

# Ensure init script is executed on first DB init
COPY init.sql /docker-entrypoint-initdb.d/

USER postgres