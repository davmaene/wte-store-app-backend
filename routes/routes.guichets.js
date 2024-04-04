import express from 'express';
import { __controlerLaoratories } from '../controlers/controler.guichets.js';
import { laboModel, onValidate } from '../middleware/ware.datavalidator.js';

export const __routesLaboratories = express.Router();

__routesLaboratories.get("/list", __controlerLaoratories.list)
__routesLaboratories.post("/guichet/add", onValidate(laboModel), __controlerLaoratories.add)
__routesLaboratories.put("/guichet/addtouser", __controlerLaoratories.addusertoguichet)
__routesLaboratories.get("/guichet/byid/:idguichet", __controlerLaoratories.getonbyid)
__routesLaboratories.delete("/guichet/:idboutique", __controlerLaoratories.delete)