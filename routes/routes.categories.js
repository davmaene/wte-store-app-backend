import express from 'express';
import { __controlerCategories } from '../controlers/controler.categories.js';
import { categoryModel, onValidate } from '../middleware/ware.datavalidator.js';

export const __routesCategories = express.Router();
__routesCategories.post("/category/add", onValidate(categoryModel), __controlerCategories.add)
__routesCategories.get("/list", __controlerCategories.list)