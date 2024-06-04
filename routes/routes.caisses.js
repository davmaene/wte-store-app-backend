import express from "express";
import { __controlerCaisse } from "../controlers/controler.caisse.js";

export const __routesCaisses = express.Router()

__routesCaisses.get("/caisse/:idguichet", __controlerCaisse.gatforguichet)
__routesCaisses.get("/assome", __controlerCaisse.getassome)