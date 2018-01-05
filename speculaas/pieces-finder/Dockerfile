FROM python:3.5 as build

RUN mkdir /target
COPY requirements.txt ./
RUN pip install --target /target --no-cache-dir -r requirements.txt

FROM python:3.5-slim
RUN mkdir /app
COPY --from=build /target /app
COPY . /app

CMD [ "python", "/app/server.py", "/app/precomputed_repacked" ]
