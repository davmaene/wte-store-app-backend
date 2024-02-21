import { Configs } from "../configs/configs.js"
import { Response } from "../helpers/helper.message.js"
import { now } from "../helpers/helper.moment.js"
import { randomLongNumber } from "../helpers/helper.random.js"
import { Produits } from "../models/model.produits.js"
import { Stores } from "../models/model.store.js"

export const __controlerStore = {
    bonentree: async (req, res, next) => {
        const trans = randomLongNumber({ length: 16 })
        const { items } = req.body
        const {} = req.currentuser;
        console.log(req.currentuser);
        if (!Array.isArray(items)) return Response(res, 401, "Items must be a type of array !")

        try {
            const newItesms = []
            for (let index = 0; index < items.length; index++) {
                const { idproduit, idunity, qte, prixachat, prixunitaire, fournisseur } = items[index];
                const prd = await Produits.findOne({
                    where: {
                        id: parseInt(idproduit)
                    }
                })
                if (prd instanceof Produits) {
                    const { prix } = prd;
                    prd.update({
                        updatedon: now({ options: {} }),
                        prix: parseFloat(prixunitaire)
                    })
                    newItesms.push({
                        idproduit,
                        prix: parseFloat(prixunitaire),
                        prixachat: parseFloat(prixachat),
                        fournisseur,
                        qte,
                        idunity
                    })
                }
            }
            Stores.create({
                transaction: trans,
                items: newItesms,
                createdby: 1
            })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    bonsortie: async (req, res, next) => {

    }
}