import expres from 'express';
import { __controlerAssets } from '../controlers/controler.assets.js';

export const __routesAssets = expres.Router()
__routesAssets.get("/as_avatar/:ressources", __controlerAssets.getressoursesavatar)
__routesAssets.get("/s/:ressources", __controlerAssets.getressourses)
__routesAssets.get("/as_products/:ressources", __controlerAssets.getressoursesasproduct)
__routesAssets.put("/as_avatar", __controlerAssets.setressourcesasavatar)
__routesAssets.get("/as_assets/:ressources", __controlerAssets.getanyressourses)