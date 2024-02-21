import express from 'express'
import { __controlerStore } from '../controlers/controler.store.js'

export const __routesStores = express.Router()
__routesStores.post("/store/in", __controlerStore.bonentree)