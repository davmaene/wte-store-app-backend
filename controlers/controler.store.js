import { Configs } from "../configs/configs.js"
import { Response } from "../helpers/helper.message.js"
import { randomLongNumber } from "../helpers/helper.random.js"
import { Produits } from "../models/model.produits.js"

export const __controlerStore = {
    bonentree: async (req, res, next) => {
        const trans = randomLongNumber({ length: 16 })
        const { items } = req.body
        if (!Array.isArray(items)) return Response(res, 401, "Items must be a type of array !")

        try {
            for (let index = 0; index < items.length; index++) {
                const { idproduit, idunity, qte, prixachat, prixunitaire, fournisseur } = items[index];
                const prd = await Produits.findOne({
                    where: {
                        id: parseInt(idproduit)
                    }
                })
            }
            return Response(res, 200, { transation: trans, items })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    bonsortie: async (req, res, next) => {

    }
}