import express from 'express';
import { __controlerRole } from '../controlers/controler.roles.js';

export const __routesRoles = express.Router()

__routesRoles.get("/list", __controlerRole.list)
__routesRoles.post("/role/add", __controlerRole.add)