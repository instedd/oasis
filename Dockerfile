FROM node:lts AS frontend
RUN mkdir /app
WORKDIR /app
ADD ./frontend/ /app/
RUN yarn install
RUN yarn build

FROM tiangolo/uvicorn-gunicorn-fastapi:python3.6 AS backend
WORKDIR /app
COPY ./backend/ /app/
RUN pip install -r requirements.txt
RUN rm -rf /app/static/*
COPY --from=frontend /app/build/ /app/static/
RUN mv /app/static/static/* /app/static/
COPY --from=frontend /app/build/index.html /app/templates/
ENV APP_MODULE="app:app"
