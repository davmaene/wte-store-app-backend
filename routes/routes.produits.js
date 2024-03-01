import express from 'express';
import { __controlerProduits } from '../controlers/controler.produits.js';

export const __routesProduits = express.Router()
__routesProduits.get("/list", __controlerProduits.list)
__routesProduits.post("/produit/add", __controlerProduits.add)
__routesProduits.delete("/produit/:idproduit", __controlerProduits.delete)
__routesProduits.put("/produit/:idproduit", __controlerProduits.update)