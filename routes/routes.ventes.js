import express from 'express'
import { __controlerVentes } from '../controlers/controler.ventes.js'

export const __routesVentes = express.Router()

__routesVentes.get("/listall", __controlerVentes.listall)
__routesVentes.get("/listall/withfilterday", __controlerVentes.listallwithfilterday)
__routesVentes.get("/listall/withfiltermonth", __controlerVentes.listallwithfiltermonth)
__routesVentes.get("/listall/withfilteryear", __controlerVentes.listallwithfilteryear)
__routesVentes.get("/list", __controlerVentes.listbyguichet)
__routesVentes.post("/vente/add", __controlerVentes.add)