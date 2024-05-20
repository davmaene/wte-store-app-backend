import express from 'express'
import { __controlerConfigs } from '../controlers/controler.configs.js'

export const __routesConfigs = express.Router()

__routesConfigs.get("/config/tx", __controlerConfigs.getconfigs)
__routesConfigs.put("/config/tx", __controlerConfigs.update)