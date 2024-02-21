import express from 'express'
import { __controlerStore } from '../controlers/controler.store.js'
import { __controlerGstore } from '../controlers/controler.gstore.js'

export const __routesStores = express.Router()
__routesStores.post("/store/in", __controlerStore.bonentree)
__routesStores.get("/store/getone/:idguichet", __controlerGstore.getstore)
__routesStores.post("/store/getone/in", __controlerGstore.bonentree)