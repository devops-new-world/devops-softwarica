FROM nginx:latest

RUN rm -rf /usr/share/nginx/html/*

COPY ./sites/pratyush/index.html /usr/share/nginx/html/

EXPOSE 80
