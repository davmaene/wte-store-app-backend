import express from 'express';
import { __controlerSubcategories } from '../controlers/controler.subcategories.js';
import { onValidate, subcategoryModel } from '../middleware/ware.datavalidator.js';

export const __routesSubcategories = express.Router()
__routesSubcategories.get("/list", __controlerSubcategories.list)
__routesSubcategories.post("/subcategory/add", onValidate(subcategoryModel), __controlerSubcategories.add)