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
COPY --from=frontend /app/build/ /app/static/
ENV APP_MODULE="app:app"
