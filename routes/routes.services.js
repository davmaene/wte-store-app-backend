import express from 'express';
import { __controlerServices } from '../controlers/controler.services.js';

export const __routesServices = express.Router();
__routesServices.post("/service/sendmail", __controlerServices.onsendmail)