import express from 'express';
import { __controlerUnities } from '../controlers/controler.unities.js';

export const __routesUnities = express.Router();
__routesUnities.get("/list", __controlerUnities.list)