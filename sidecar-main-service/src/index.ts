import express, { Express, Request, Response , Application } from 'express';
import moran from 'morgan';
import dotenv from 'dotenv';
import morgan from "morgan";

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

const requiredAuthRole = ["USER", "ADMIN"];

const adminProtectedPaths = ['/admin', '/metrics']

app.use(morgan('dev'));

app.use((req, res, next) => {

    const authHeader = req.get("x-app-auth");
    console.log(`x-app-auth header value: ${authHeader}`);

    if(authHeader === undefined || ! requiredAuthRole.includes(authHeader)) {
        return res.status(403).json({
            message: `User does not have role in ${requiredAuthRole}`
        });
    }

    const path = req.path;

    if(adminProtectedPaths.includes(path)) {
        if(authHeader !== "ADMIN") {
            return res.status(403).json({
                message: `User forbidden to access ${path}`
            });
        }
    }


    next();
})



app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to main service Express & TypeScript Server');
});

app.get('/admin', (req: Request, res: Response) => {
    res.send('Welcome to main service admin page');
});

app.get('/metrics', (req: Request, res: Response) => {
    res.send('Welcome to main service metrics page');
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});