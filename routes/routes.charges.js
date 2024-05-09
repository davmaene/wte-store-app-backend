import express from 'express';
import { __controlerChages } from '../controlers/controler.charges.js';

export const __routesCharges = express.Router();

__routesCharges.post("/charge/add", __controlerChages.addcharge)