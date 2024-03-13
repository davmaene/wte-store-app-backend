import { Response } from "../helpers/helper.message.js"
import { now } from "../helpers/helper.moment.js";
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
                    const { idproduit, qte: qtecommander } = items[index];
                    const prd = await Produits.findOne({
                        where: {
                            id: parseInt(idproduit)
                        }
                    })
                    if (prd instanceof Produits) {
                        const { prix, qte: qtedisponible } = prd;
                        if (parseInt(qtecommander) <= parseInt(qtedisponible)) {
                            prd.update({
                                qte: parseInt(qtedisponible) - parseInt(qtecommander),
                                updatedon: now({ options: {} }),
                            })
                            newItesms.push({
                                idproduit,
                                prix: parseFloat(prix),
                                qte: qtecommander
                            })
                        } else {
                            notapprouvedItems.push(items[index])
                        }
                    } else {
                        notapprouvedItems.push(items[index])
                    }
                }

                if (newItesms.length > 0) {

                    GStores.findOne({
                        where: {
                            idguichet: parseInt(idguichet)
                        }
                    }).then(gstore => {
                        if (gstore instanceof GStores) {
                            console.log("The store found ==> ", gstore.toJSON());
                            const { items } = gstore.toJSON()
                            gstore.update({
                                updatedon: now({ options: {} }),
                                items: [
                                    ...items,
                                    ...newItesms
                                ]
                            })
                                .then(U => {
                                    return Response(res, 200, { transaction: trans, length: newItesms.length, items: newItesms })
                                })
                                .catch(E => {
                                    return Response(res, 400, E)
                                })
                        } else {
                            console.log("The store not found ==> ", idguichet);
                            GStores.create({
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
                        }
                    })

                } else {
                    return Response(res, 400, "The principal store is empty ! so we can not process with the request ")
                }
            } else {
                return Response(res, 400, "The principal store is empty ! so we can not process with the request ")
            }
        } catch (error) {
            console.log(error);
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
                .then(async st => {
                    if (st instanceof GStores) {
                        const { items } = st;
                        const produits = []
                        for (let index = 0; index < items.length; index++) {
                            const { idproduit, qte } = items[index];
                            let prd = await Produits.findOne({
                                where: {
                                    id: parseInt(idproduit),
                                },
                                attributes: ['id', 'prix', 'produit', 'currency', 'description', 'uuid']
                            })
                            if (prd instanceof Produits) {
                                prd = prd.toJSON()
                                produits.push({ ...prd, qte });
                            }
                        }
                        st = st.toJSON()
                        delete st['items']
                        return Response(res, 200, { ...st, __tbl_produits: produits })
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