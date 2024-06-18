import express from "express";
import { __controlerRapports } from "../controlers/controler.rapport";

export const __routesRapport = express.Router()

__routesRapport.get("/dayly", __controlerRapports.dayly)
__routesRapport.get("/monthly", __controlerRapports.monthly)
__routesRapport.get("/yearly", __controlerRapports.yearly)