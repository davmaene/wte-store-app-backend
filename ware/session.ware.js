import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { excludedRoutes } from '../helpers/helper.authtoken.js';

dotenv.config();

const { APPACCESKEY } = process.env;

export const tokenGenerate = async ({ data }, cb) => {
    jwt.sign(
        {
            data
        }, APPACCESKEY,
        {
            expiresIn: '1h',
        }, (err, encoded) => {
            cb(err, encoded)
        }
    )
};

export const tokenVerify = async ({ url, token }, cb) => {
    const _routes = excludedRoutes;
    if(_routes.indexOf(url) !== -1) return cb(undefined, true);
    else{
        jwt.verify(token, APPACCESKEY, (err, decoded) => {
            cb(err, decoded)
        });
    }
};