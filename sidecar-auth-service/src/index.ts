import express, { Express, Request, Response , Application } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import {proxyExpressRequest} from "./axios-express-proxy/axios-express-proxy";

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3001;

const PROXY_USER_HEADER_VAL = "PERSON";
const PROXY_ADMIN_HEADER_VAL = "SUPER";
const USER_HEADER_VAL = "USER";
const ADMIN_HEADER_VAL = "ADMIN";

app.use(morgan('dev'));

app.use('/stats', (req, res) => {
    res.send("Metrics endpoint");
})

app.use((req: Request, res: Response) => {

    if(req.get('x-app-auth')) {
        // If the user has x-app-auth already we assume that they know what their doing and we do not override
    } else {
        const proxyAppAuth = req.get('x-proxy-app-auth');
        if(proxyAppAuth) {
            console.log(`Detected Proxy Auth Header: ${proxyAppAuth}...`);
            if(proxyAppAuth === PROXY_ADMIN_HEADER_VAL) {
                console.log(`...Setting App auth to ${ADMIN_HEADER_VAL}`);
                req.headers['x-app-auth'] = ADMIN_HEADER_VAL;
            } else if(proxyAppAuth === PROXY_USER_HEADER_VAL) {
                console.log(`...Setting App auth to ${USER_HEADER_VAL}`);
                req.headers['x-app-auth'] = USER_HEADER_VAL;
            } else {
                console.log("...No match found not setting app auth header");
            }
        }
    }

    proxyExpressRequest('http://localhost:3000', req, res);
});



app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});