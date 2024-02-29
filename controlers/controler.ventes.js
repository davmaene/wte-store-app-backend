import { Configs } from "../configs/configs.js";
import { replacerProduit } from "../helpers/helper.helper.js";
import { Response } from "../helpers/helper.message.js"
import { GStores } from "../models/model.guichetstores.js";
import { Produits } from "../models/model.produits.js";
import { Ventes } from "../models/model.ventes.js"

export const __controlerVentes = {
    add: async (req, res, next) => {
        const { idproduit, qte: asqte, prix: asprix, currency: ascurrency } = req.body;
        const { __id, idguichet } = req.currentuser;
        if (!__id || !idguichet) return Response(res, 401, "User not recognize to proced with this request !")
        if (!idproduit) return Response(res, 401, "This request must have at least idproduit !")

        try {
            const transaction = await Configs.transaction()
            const prd = await Produits.findOne({
                where: {
                    id: parseInt(idproduit)
                },
                attributes: ['id', 'currency', 'prix', 'produit', 'qte']
            }, { transaction })

            const store = await GStores.findOne({
                where: {
                    id: idguichet
                }
            }, { transaction })

            if (prd && prd instanceof Produits && store instanceof GStores) {
                const { items } = store;
                const sales = [];
                let idx = 0
                let item = {}
                let oldqtep = 0;
                const { id: asid, prix, currency, qte } = prd;

                for (let index = 0; index < items.length; index++) {
                    const { idproduit: id, qte: oldqte } = items[index];
                    if (parseInt(id) === parseInt(asid)) {
                        idx = id
                        item = items[index]
                        oldqtep = oldqte
                        const sale = await Ventes.create({
                            idproduit,
                            prixvente: parseFloat(prix),
                            currency,
                            createdby: __id,
                            idguichet,
                            status: 1
                        }, { transaction })
                        sales.push(sale)
                    }
                }
                if (sales.length > 0) {
                    const newitems = replacerProduit({ items, idproduit: idx, item: { ...item, qte: oldqtep - 1 } })
                    prd.update({
                        qte: qte - 1
                    })

                    store.update({
                        items: newitems
                    })

                    transaction.commit()
                    return Response(res, 200, { newitems, prd, store })
                } else {
                    transaction.rollback()
                    return Response(res, 400, "Operation of sale faild !")
                }
            } else {
                transaction.rollback()
                return Response(res, 400, "Product not found and Store not found !")
            }
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    listall: async (req, res, next) => {
        try {
            Ventes.findAndCountAll({
                where: {
                    status: 1
                }
            })
                .then((rows, count) => {
                    return Response(res, 200, { list: rows, length: count })
                })
                .catch(err => {
                    return Response(res, 500, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    listbyguichet: async (req, res, next) => {
        const { idguichet } = req.params
        try {
            Ventes.findAndCountAll({
                where: {
                    idguichet,
                    status: 1
                }
            })
                .then((rows, count) => {
                    return Response(res, 200, { list: rows, length: count })
                })
                .catch(err => {
                    return Response(res, 500, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}