import { Op, where } from "sequelize";
import { Configs } from "../configs/configs.js";
import { converterDevise, renderAsLisibleNumber, replacerProduit } from "../helpers/helper.helper.js";
import { Response } from "../helpers/helper.message.js"
import { Guichets } from "../models/model.guichets.js";
import { GStores } from "../models/model.guichetstores.js";
import { Produits } from "../models/model.produits.js";
import { Users } from "../models/model.users.js";
import { Ventes } from "../models/model.ventes.js";
import { v4 as uuidv4 } from 'uuid';
import { endOfDayInUnix, startOfDayInUnix } from "../helpers/helper.momentwithoutlocal.js";
import { getDayStartAndEnd, getMonthStartAndEnd, getYearStartAndEnd, now, unixToDate } from "../helpers/helper.moment.js";
import { Caisses } from "../models/model.caisse.js";

export const __controlerVentes = {
    add: async (req, res, next) => {

        const { idtransaction, customer, phone, cart } = req.body;
        if (!idtransaction || !cart) return Response(res, 401, "This request must have at least idtransaction || cart")
        const { __id, idguichet } = req.currentuser;
        if (!__id || !idguichet) return Response(res, 401, "User not recognize to proced with this request !")
        try {
            const transaction = await Configs.transaction()

            let store = await GStores.findAll({
                order: [['id', 'DESC']],
                where: {
                    idguichet: parseInt(idguichet)
                },
                limit: 1
            }, { transaction })

            let [caisse, isnewcaisse] = await Caisses.findOrCreate({
                defaults: {
                    idguichet,
                    amount: 0,
                    lastupdatedby: __id
                },
                where: {
                    idguichet: parseInt(idguichet)
                }
            })

            if (store && store[0] instanceof GStores) {
                store = store[0]
                const { amount: ascaisseamount } = caisse.toJSON()
                let { items, transaction: astransaction } = store;
                items = Array.isArray(items) ? [...items] : JSON.parse(items)
                const sales = [];
                let idx = 0
                let item = {}
                let oldqtep = 0;

                for (let index = 0; index < cart.length; index++) {
                    const { realid, qte, idproduit, prix: prixfromcart, currency: currencyfromcart } = cart[index];
                    const prd = await Produits.findOne({
                        where: {
                            id: parseInt(realid)
                        },
                        attributes: ['id', 'currency', 'prix', 'produit', 'qte']
                    }, { transaction })
                    const { id: asid, prix, currency, qte: currentqte } = prd;
                    for (let index = 0; index < items.length; index++) {
                        const { idproduit: id, qte: oldqte, prix: asptixfromstore, prixachat, qte_disponible } = items[index];
                        if (parseInt(id) === parseInt(asid)) {
                            idx = id
                            item = items[index]
                            oldqtep = oldqte
                            const sale = await Ventes.create({
                                customer,
                                phone,
                                taransaction: idtransaction,
                                uuid: uuidv4(),
                                qte: qte,
                                idproduit: realid,
                                prixvente: prixfromcart ? parseFloat(prixfromcart) : asptixfromstore,
                                prixachat: parseFloat(prixachat),
                                currency: currencyfromcart || currency,
                                createdby: __id,
                                idguichet,
                                status: 1
                            }, { transaction })

                            sales.push({ ...sale.toJSON(), idx: asid, oldqte, qte_disponible })
                        }
                    }
                }

                console.log('====================================');
                console.log(sales);
                console.log('====================================');

                if (sales.length > 0) {
                    let newitems = []
                    const _itemsToCaisse = [0, 0, ascaisseamount];
                    for (let index = 0; index < sales.length; index++) {
                        const { idproduit, qte, prixvente, oldqte, currency } = sales[index];
                        const { code, message, data } = await converterDevise({ amount: prixvente, currency });
                        const { amount } = data
                        _itemsToCaisse.push(amount)
                        newitems = replacerProduit({ items, idproduit, item: { ...{ idproduit, prix: prixvente }, qte: oldqte - qte, qte_disponible: oldqte - qte } })
                    }

                    GStores.update({
                        updatedon: now({ options: {} }),
                        items: [...newitems]
                    }, {
                        where: {
                            transaction: astransaction
                        }
                    })

                    caisse.update({
                        amount: _itemsToCaisse.reduce((prev, next) => parseFloat(prev) + parseFloat(next)),
                        currency: "CDF",
                        lastupdatedby: __id,
                        updatedon: now({ options: {} })
                    })

                    transaction.commit()
                    return Response(res, 200, {
                        // ...sales[0].toJSON(),
                        __tbl_produits: sales
                    })
                } else {
                    transaction.rollback()
                    return Response(res, 400, "Operation of sale faild !")
                }
            } else {
                transaction.rollback()
                return Response(res, 400, { message: "Product not found OR Store not found !", idguichet })
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
                .then(async ({ rows, count }) => {
                    const benefices = [];
                    for (let index = 0; index < Array.from(rows).length; index++) {

                        const { currency, prixachat, prixvente } = rows[index];
                        const { data: d1 } = await converterDevise({ amount: prixachat, currency })
                        const { amount: as_prix_achat } = d1;
                        const { data: d2 } = await converterDevise({ amount: prixvente, currency })
                        const { amount: as_prix_vente } = d2;

                        benefices.push(as_prix_vente - as_prix_achat)
                    }
                    const b = renderAsLisibleNumber({ nombre: Array.from([...[0, 0], ...benefices]).reduce((p, r) => p + r) })
                    return Response(res, 200, { list: rows, length: count, benefices: String(b).concat(" CDF") })
                })
                .catch(err => {
                    console.log('====================================');
                    console.log(err);
                    console.log('====================================');
                    return Response(res, 500, err)
                })
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
            return Response(res, 500, error)
        }
    },
    listallwithfilterday: async (req, res, next) => {
        const { unix } = req.query;
        if (!unix || isNaN(parseInt(unix))) return Response(res, 401, "This request must have at least unix as date !");
        const { startOfDay, endOfDay } = getDayStartAndEnd({ unixTimestamp: unix })

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
                    status: 1,
                    [Op.and]: [
                        { createdonunix: { [Op.gte]: startOfDay } },
                        { createdonunix: { [Op.lte]: endOfDay } }
                    ]
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
                .then(async ({ rows, count }) => {
                    const benefices = [];
                    for (let index = 0; index < Array.from(rows).length; index++) {

                        const { currency, prixachat, prixvente } = rows[index];
                        const { data: d1 } = await converterDevise({ amount: prixachat, currency })
                        const { amount: as_prix_achat } = d1;
                        const { data: d2 } = await converterDevise({ amount: prixvente, currency })
                        const { amount: as_prix_vente } = d2;

                        benefices.push(as_prix_vente - as_prix_achat)
                    }
                    const b = renderAsLisibleNumber({ nombre: Array.from([...[0, 0], ...benefices]).reduce((p, r) => p + r) })
                    return Response(res, 200, { list: rows, length: count, benefices: String(b).concat(" CDF") })
                })
                .catch(err => {
                    console.log('====================================');
                    console.log(err);
                    console.log('====================================');
                    return Response(res, 500, err)
                })
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
            return Response(res, 500, error)
        }
    },
    listallwithfiltermonth: async (req, res, next) => {
        const { unix } = req.query;
        if (!unix || isNaN(parseInt(unix))) return Response(res, 401, "This request must have at least unix as date !");
        const { startOfDay, endOfDay } = getMonthStartAndEnd({ unixTimestamp: unix })

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
                    status: 1,
                    [Op.and]: [
                        { createdonunix: { [Op.gte]: startOfDay } },
                        { createdonunix: { [Op.lte]: endOfDay } }
                    ]
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
                .then(async ({ rows, count }) => {
                    const benefices = [];
                    for (let index = 0; index < Array.from(rows).length; index++) {

                        const { currency, prixachat, prixvente } = rows[index];
                        const { data: d1 } = await converterDevise({ amount: prixachat, currency })
                        const { amount: as_prix_achat } = d1;
                        const { data: d2 } = await converterDevise({ amount: prixvente, currency })
                        const { amount: as_prix_vente } = d2;

                        benefices.push(as_prix_vente - as_prix_achat)
                    }
                    const b = renderAsLisibleNumber({ nombre: Array.from([...[0, 0], ...benefices]).reduce((p, r) => p + r) })
                    return Response(res, 200, { list: rows, length: count, benefices: String(b).concat(" CDF") })
                })
                .catch(err => {
                    console.log('====================================');
                    console.log(err);
                    console.log('====================================');
                    return Response(res, 500, err)
                })
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
            return Response(res, 500, error)
        }
    },
    listallwithfilteryear: async (req, res, next) => {
        const { unix } = req.query;
        if (!unix || isNaN(parseInt(unix))) return Response(res, 401, "This request must have at least unix as date !");
        const { startOfDay, endOfDay } = getYearStartAndEnd({ unixTimestamp: unix })
        console.log('====================================');
        console.log(startOfDay, endOfDay, unixToDate({ unix: startOfDay }), unixToDate({ unix: endOfDay }));
        console.log('====================================');
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
                    status: 1,
                    [Op.and]: [
                        { createdonunix: { [Op.gte]: startOfDay } },
                        { createdonunix: { [Op.lte]: endOfDay } }
                    ]
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
                .then(async ({ rows, count }) => {
                    const benefices = [];
                    for (let index = 0; index < Array.from(rows).length; index++) {

                        const { currency, prixachat, prixvente } = rows[index];
                        const { data: d1 } = await converterDevise({ amount: prixachat, currency })
                        const { amount: as_prix_achat } = d1;
                        const { data: d2 } = await converterDevise({ amount: prixvente, currency })
                        const { amount: as_prix_vente } = d2;

                        benefices.push(as_prix_vente - as_prix_achat)
                    }
                    const b = renderAsLisibleNumber({ nombre: Array.from([...[0, 0], ...benefices]).reduce((p, r) => p + r) })
                    return Response(res, 200, { list: rows, length: count, benefices: String(b).concat(" CDF") })
                })
                .catch(err => {
                    console.log('====================================');
                    console.log(err);
                    console.log('====================================');
                    return Response(res, 500, err)
                })
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
            return Response(res, 500, error)
        }
    },
    listbyguichet: async (req, res, next) => {
        const { __id, idguichet } = req.currentuser;
        console.log(req.currentuser);
        try {

            Users.hasOne(Users, { foreignKey: "id" });
            Ventes.belongsTo(Users, { foreignKey: "createdby" });

            Produits.hasOne(Ventes, { foreignKey: "id" });
            Ventes.belongsTo(Produits, { foreignKey: "idproduit" });

            Guichets.hasOne(Ventes, { foreignKey: "id" });
            Ventes.belongsTo(Guichets, { foreignKey: "idguichet" });

            const start = startOfDayInUnix()
            const end = endOfDayInUnix()

            console.log(unixToDate({ unix: 1713391199 }), unixToDate({ unix: start }), unixToDate({ unix: end }));

            Ventes.findAndCountAll({
                order: [['id', 'DESC']],
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
                ],
                // logging: true,
                where: {
                    idguichet,
                    status: 1,
                    [Op.and]: [
                        { createdonunix: { [Op.gt]: start } },
                        { createdonunix: { [Op.lte]: end } }
                    ]
                }
            })
                .then(async ({ rows, count }) => {
                    const benefices = [];
                    for (let index = 0; index < Array.from(rows).length; index++) {

                        const { currency, prixachat, prixvente } = rows[index];
                        const { data: d1 } = await converterDevise({ amount: prixachat, currency })
                        const { amount: as_prix_achat } = d1;
                        const { data: d2 } = await converterDevise({ amount: prixvente, currency })
                        const { amount: as_prix_vente } = d2;

                        benefices.push(as_prix_vente - as_prix_achat)
                    }
                    const b = renderAsLisibleNumber({ nombre: Array.from([...[0, 0], ...benefices]).reduce((p, r) => p + r) })
                    return Response(res, 200, { list: rows, length: count, benefices: String(b).concat(" CDF") })
                })
                .catch(err => {
                    console.log('====================================');
                    console.log(err);
                    console.log('====================================');
                    return Response(res, 500, err)
                })
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
            return Response(res, 500, error)
        }
    }
}