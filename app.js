import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import uploader from 'express-fileupload';
import cookieParser from 'cookie-parser';
import { Response } from './helpers/helper.message.js';
import { Routes } from './routes/index.js';
import { Middleware } from './middleware/ware.cookies.js';
import { accessValidator } from './middleware/ware.ufw.js';

dotenv.config();

const { APPPORT, APPCOOKIESNAME, APPRATELIMITMAXREQS, APPRATELIMITTIMING, APPAPIKEY } = process.env;

const __app = express();
const PORT = APPPORT || 4009;

const limiter = rateLimit({
    windowMs: parseInt(APPRATELIMITTIMING) * 60 * 1000,
    max: parseInt(APPRATELIMITMAXREQS),
    standardHeaders: false,
    legacyHeaders: false,
    message: {
        status: 429,
        message: "Too many requests please try again in " + APPRATELIMITTIMING + " minutes",
        data: {}
    }
});

__app.use(cors());
__app.use(express.urlencoded({ extended: true, limit: '50mb' }));
__app.use(express.json({ limit: '50mb' }));
__app.use(uploader());
__app.use(limiter);
__app.use(cookieParser(APPCOOKIESNAME));

__app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'"
    );
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    )
    return next();
});

__app.get("/", accessValidator, (req, res, next) => {
    return Response(res, 200, {
        token: APPAPIKEY,
        message: "WTE STORE APP",
        ident: Math.floor(Math.random() * 100000)
    })
});

__app.get("/guard/g", (req, res, next) => {
    return Response(res, 200, {
        message: "WTE STORE APP",
        token: APPAPIKEY,
        ident: Math.floor(Math.random() * 100000)
    })
});

__app.get("/oauth/google", (req, res, next) => {
    return Response(res, 200, {
        token: APPAPIKEY,
        ident: Math.floor(Math.random() * 100000)
    })
});

__app.use("/api", accessValidator, Routes);

__app.use("/guard/g/api", Routes);

__app.use(accessValidator, (req, res, next) => {
    return Response(res, 404, {
        message: "Ressource not found on this server !",
        url: req.url,
        body: req.body,
        method: req.method
    })
});

__app.listen(PORT, () => {
    console.log("Server is up on " + PORT);
});
