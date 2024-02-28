import express from 'express'
import { __controlerVentes } from '../controlers/controler.ventes.js'

export const __routesVentes = express.Router()
__routesVentes.get("/listall", __controlerVentes.listall)