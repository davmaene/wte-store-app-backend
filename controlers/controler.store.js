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
        const { phone: asphone, uuid, roles, __id, iat, exp, jti } = req.currentuser;
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
                    const { prix, qte: asqte } = prd;
                    prd.update({
                        qte: parseInt(asqte),
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
                createdby: __id
            })
                .then(str => {
                    if (str instanceof Stores) {
                        return Response(res, 200, { transaction: trans, length: newItesms.length, items: newItesms })
                    } else {
                        return Response(res, 400, str)
                    }
                })
                .catch(err => {
                    return Response(res, 503, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    bonsortie: async (req, res, next) => {

    }
}