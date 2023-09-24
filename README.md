# Sidecar Exp

A simple app to demonstrate using a header modifying proxy as a sidecar, first in docker then in kubernetes

## Current Status

At the moment, it is just has two apps with one (./sidecar-auth-proxy), a golang web app running on port 3001 acting as a simple proxy for the other (./sidecar-main-service), a TS express service runninng on port 3001

### TODO
* Deploy to kubenetes cluster (using sidecar pattern).
* Convert sidecar-auth-proxy to make use of OpenPolicy to set the required headers

## Operation

The main service checks the x-app-auth header for the following values when visiting the relevant url

| url 		| Required Header Value |
| --- 		| ---					|
| /admin 	| ADMIN					|
| /metrics 	| ADMIN					|
| any other | USER					|

The proxy service will forward the x-app-auth header directly to the main service, however, if the x-proxy-app-auth header is set it will add the x-app-auth header with the following values

| x-proxy-app-auth value	| x-app-auth value 	|
| ---						| ---				|
| PERSON					| USER				|
| SUPER						| ADMIN				|

This is to demonstrate that we can forward and translate auth headers as required in a standard way

## Useful commands

The following curl commands will allow the functionality to be demonstrated if the services are just stood up standalone. 

### Direct to main service curl commands

All these commands test the main service directly, i.e. not through the proxy

#### No x-app-auth header set

As no x-app-auth header is set this should return 403 error

```
curl -v --location 'http://localhost:3000/'
```

#### USER x-app-auth header set - base url

As this is going to a non admin protected url then it should return 200 
```
curl -v --location 'http://localhost:3000/' --header 'x-app-auth: USER'
```

#### USER x-app-auth header set - metrics url

As this is attempting to access an admin protected url it will return 403 as the header is only set to USER
```
curl -v --location 'http://localhost:3000/metrics' --header 'x-app-auth: USER'
```

#### ADMIN x-app-auth header set - metrics url

Again protected url but with ADMIN header value set so should get 200
```
curl -v --location 'http://localhost:3000/metrics' --header 'x-app-auth: ADMIN'
```

### Proxied calls to main service

These all pass through the proxy service

#### No x-app-auth header set

As no x-app-auth header is set this should return 403 error

```
curl -v --location 'http://localhost:3001/'
```

#### USER x-app-auth header set - base url

As this is going to a non admin protected url then it should return 200 
```
curl -v --location 'http://localhost:3001/' --header 'x-app-auth: USER'
```

#### USER x-app-auth header set - metrics url

As this is attempting to access an admin protected url it will return 403 as the header is only set to USER
```
curl -v --location 'http://localhost:3001/metrics' --header 'x-app-auth: USER'
```

#### ADMIN x-app-auth header set - metrics url

Again protected url but with ADMIN header value set so should get 200
```
curl -v --location 'http://localhost:3001/metrics' --header 'x-app-auth: ADMIN'
```

#### PERSON x-proxy-app-auth header set - base url

Should work as this is translated to USER x-app-auth header
```
curl -v --location 'http://localhost:3001/' --header 'x-proxy-app-auth: PERSON'
```

#### PERSON x-proxy-app-auth header set - metric url

Forbidden as not translated to ADMIN role
```
curl -v --location 'http://localhost:3001/metrics' --header 'x-proxy-app-auth: PERSON'
```

#### SUPER x-proxy-app-auth header set - metrics url

Should be allowed as translated to admin
```
curl -v --location 'http://localhost:3001/metrics' --header 'x-proxy-app-auth: SUPER'
```