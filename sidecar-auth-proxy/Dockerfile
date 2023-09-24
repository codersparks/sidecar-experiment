FROM golang:1.21.1-alpine3.18 AS BuildStage

WORKDIR /app

copy . .

RUN go mod download

EXPOSE 3001

RUN go build -o /dist/sidecar-auth-proxy proxy.go

FROM alpine:3.18.3

WORKDIR /

copy --from=BuildStage /dist/sidecar-auth-proxy /sidecar-auth-proxy

EXPOSE 3001

ENTRYPOINT ["/sidecar-auth-proxy"]