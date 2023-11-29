import express from "express";
import { __controlerPronvinces } from "../controlers/controler.provinces.js";

export const __routesProvinces = express.Router();
__routesProvinces.get("/list", __controlerPronvinces.liste)

