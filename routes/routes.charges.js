import express from 'express';
import { __controlerChages } from '../controlers/controler.charges.js';

export const __routesCharges = express.Router();

__routesCharges.post("/charge/add", __controlerChages.addcharge)
__routesCharges.put("/charge/:idcharge", __controlerChages.update)
__routesCharges.delete("/charge/:idcharge", __controlerChages.deletecharge)
__routesCharges.get("/list", __controlerChages.list)