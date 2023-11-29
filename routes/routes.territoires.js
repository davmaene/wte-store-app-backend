import express from 'express'
import { territoiresController } from '../controlers/controler.territoires.js';


export const _routesterritoires = express.Router();

    _routesterritoires.post("/register", territoiresController.addTerritoires )
    _routesterritoires.get("/list", territoiresController.liste )
    _routesterritoires.get("/list/by/:idprovince", territoiresController.listebyprovince )
    _routesterritoires.delete("/territoire/:id", territoiresController.deleteTerritoire )
    _routesterritoires.put("/territoire/:id", territoiresController.updateTerritoire )
