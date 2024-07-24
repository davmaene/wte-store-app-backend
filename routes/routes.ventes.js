import express from 'express'
import { __controlerVentes } from '../controlers/controler.ventes.js'

export const __routesVentes = express.Router()
__routesVentes.get("/listall", __controlerVentes.listall)
__routesVentes.get("/listall/withfilter", __controlerVentes.listallwithfilter)
__routesVentes.get("/list", __controlerVentes.listbyguichet)
__routesVentes.post("/vente/add", __controlerVentes.add)