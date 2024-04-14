import express from 'express';
import { __controlerProduits } from '../controlers/controler.produits.js';
import { __controlerGstore } from '../controlers/controler.gstore.js';

export const __routesProduits = express.Router()

__routesProduits.get("/list", __controlerProduits.list)
__routesProduits.get("/listinstore/byguichet", __controlerGstore.getlistproduitinstoreparguichet)
__routesProduits.post("/produit/add", __controlerProduits.add)
__routesProduits.delete("/produit/:idproduit", __controlerProduits.delete)
__routesProduits.put("/produit/:idproduit", __controlerProduits.update)
__routesProduits.get("/produit/bybarcode/:barcode", __controlerProduits.getonbycode)
__routesProduits.get("/produit/bybarcode/ingstore/:barcode", __controlerProduits.getonbycodeinstore)