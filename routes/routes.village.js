import express from "express";
import { villageController } from "../controlers/controler.village.js";
export const _routesVillage = express.Router();

    _routesVillage.post("/village/register", villageController.addvillage )
    _routesVillage.get("/liste", villageController.liste )
    _routesVillage.get("/liste/byterritory/:idterritoire", villageController.listebyterritoire )
    _routesVillage.put("/village/bycoords", villageController.getvillagebycoords )
    _routesVillage.delete("/:id", villageController.deleteVillage )
    _routesVillage.put("/:id", villageController.updateVillage )