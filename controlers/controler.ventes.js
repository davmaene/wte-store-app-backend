import { Configs } from "../configs/configs.js";
import { replacerProduit } from "../helpers/helper.helper.js";
import { Response } from "../helpers/helper.message.js"
import { now } from "../helpers/helper.moment.js";
import { Guichets } from "../models/model.guichets.js";
import { GStores } from "../models/model.guichetstores.js";
import { Produits } from "../models/model.produits.js";
import { Users } from "../models/model.users.js";
import { Ventes } from "../models/model.ventes.js";
import { v4 as uuidv4 } from 'uuid';

export const __controlerVentes = {
    add: async (req, res, next) => {

        const { idtransaction, customer, phone, cart } = req.body;
        if (!idtransaction || !cart) return Response(res, 401, "This request must have at least idtransaction || cart")
        const { __id, idguichet } = req.currentuser;
        if (!__id || !idguichet) return Response(res, 401, "User not recognize to proced with this request !")

        try {
            const transaction = await Configs.transaction()
            const prd = await Produits.findOne({
                where: {
                    id: parseInt(idproduit)
                },
                attributes: ['id', 'currency', 'prix', 'produit', 'qte']
            }, { transaction })

            let store = await GStores.findAll({
                order: [['id', 'DESC']],
                where: {
                    idguichet: parseInt(idguichet)
                },
                limit: 1
            }, { transaction })

            if (store && store[0] instanceof GStores) {
                store = store[0]
                const { items, transaction: astransaction } = store;
                const sales = [];
                let idx = 0
                let item = {}
                let oldqtep = 0;
                const { id: asid, prix, currency, qte } = prd;

                for (let index = 0; index < cart.length; index++) {
                    const { realid, qte } = array[index];
                    for (let index = 0; index < items.length; index++) {
                        const { idproduit: id, qte: oldqte } = items[index];
                        if (parseInt(id) === parseInt(asid)) {
                            idx = id
                            item = items[index]
                            oldqtep = oldqte
                            const sale = await Ventes.create({
                                uuid: uuidv4(),
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

                }

                if (sales.length > 0) {
                    const newitems = replacerProduit({ items, idproduit: idx, item: { ...item, qte: oldqtep - 1 } })
                    prd.update({
                        qte: qte - 1
                    })

                    GStores.update({
                        updatedon: now({ options: {} }),
                        items: [...newitems]
                    }, {
                        where: {
                            transaction: astransaction
                        }
                    })

                    transaction.commit()
                    return Response(res, 200, {
                        ...sales[0].toJSON(),
                        __tbl_produits: prd
                    })
                } else {
                    transaction.rollback()
                    return Response(res, 400, "Operation of sale faild !")
                }
            } else {
                transaction.rollback()
                return Response(res, 400, { message: "Product not found OR Store not found !", produit: prd, store, idguichet })
            }
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    listall: async (req, res, next) => {
        try {

            Users.hasOne(Users, { foreignKey: "id" });
            Ventes.belongsTo(Users, { foreignKey: "createdby" });

            Produits.hasOne(Ventes, { foreignKey: "id" });
            Ventes.belongsTo(Produits, { foreignKey: "idproduit" });

            Guichets.hasOne(Ventes, { foreignKey: "id" });
            Ventes.belongsTo(Guichets, { foreignKey: "idguichet" });

            Ventes.findAndCountAll({
                order: [['id', 'DESC']],
                where: {
                    status: 1
                },
                include: [
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone']
                    },
                    {
                        model: Produits,
                        required: true
                    },
                    {
                        model: Guichets,
                        required: true
                    }
                ]
            })
                .then(({ rows, count }) => {
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
                order: [['id', 'DESC']],
                where: {
                    idguichet,
                    status: 1
                }
            })
                .then(({ rows, count }) => {
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