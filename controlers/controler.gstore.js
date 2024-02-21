import { Response } from "../helpers/helper.message.js"
import { randomLongNumber } from "../helpers/helper.random.js";
import { Guichets } from "../models/model.guichets.js"
import { GStores } from "../models/model.guichetstores.js"
import { Produits } from "../models/model.produits.js";
import { Stores } from "../models/model.store.js";

export const __controlerGstore = {
    bonentree: async (req, res, next) => {
        const { items, idguichet } = req.body;
        if (!items || !idguichet) return Response(res, 401, "This request must have at least items as paramter !")
        const trans = randomLongNumber({ length: 16 })
        const { phone: asphone, uuid, roles, __id, iat, exp, jti } = req.currentuser;
        if (!Array.isArray(items)) return Response(res, 401, "Items must be a type of array !")

        try {
            const store = await Stores.findOne({
                order: [['id', 'DESC']],
            })
            if (store instanceof Stores) {
                const { items: asitems } = store;
                const newItesms = []
                const approuvedItems = [];
                const notapprouvedItems = [];

                for (let index = 0; index < items.length; index++) {
                    const { idproduit, qte } = items[index];
                    const prd = await Produits.findOne({
                        where: {
                            id: parseInt(idproduit)
                        }
                    })
                    if (prd instanceof Produits) {
                        const { prix, qte: asqte } = prd;
                        if (asqte >= qte) {
                            prd.update({
                                qte: parseInt(asqte) - parseInt(qte),
                                updatedon: now({ options: {} }),
                                prix: parseFloat(prixunitaire)
                            })
                            newItesms.push({
                                idproduit,
                                prix: parseFloat(prix),
                                qte
                            })
                            approuvedItems.push(items[index])
                        } else {
                            notapprouvedItems.push(items[index])
                        }
                    } else {
                        notapprouvedItems.push(items[index])
                    }
                }

                if (newItesms.length > 0) {
                    await GStores.create({
                        idguichet: parseInt(idguichet),
                        transaction: trans,
                        items: newItesms,
                        createdby: __id
                    })
                        .then(str => {
                            if (str instanceof GStores) {
                                return Response(res, 200, { transaction: trans, length: newItesms.length, items: newItesms })
                            } else {
                                return Response(res, 400, str)
                            }
                        })
                        .catch(err => {
                            return Response(res, 503, err)
                        })
                } else {
                    return Response(res, 400, "The principal store is empty ! so we can not process with the request ")
                }
            } else {
                return Response(res, 400, "The principal store is empty ! so we can not process with the request ")
            }
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    getstore: async (req, res, next) => {
        const { idguichet } = req.params
        try {

            Guichets.hasOne(GStores, { foreignKey: "idguichet" });
            GStores.belongsTo(Guichets, { foreignKey: "idguichet" });

            GStores.findOne({
                where: {
                    idguichet: parseInt(idguichet)
                },
                include: [
                    {
                        model: Guichets,
                        required: true
                    }
                ]
            })
                .then(st => {
                    if (st instanceof GStores) {
                        return Response(res, 200, st)
                    } else {
                        return Response(res, 400, st)
                    }
                })
                .catch(er => {
                    return Response(res, 503, er)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}