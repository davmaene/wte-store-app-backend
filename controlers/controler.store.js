import { findUnityMesure } from "../helpers/helper.helper.js"
import { Response } from "../helpers/helper.message.js"
import { now } from "../helpers/helper.moment.js"
import { randomLongNumber } from "../helpers/helper.random.js"
import { Categories } from "../models/model.categories.js"
import { Produits } from "../models/model.produits.js"
import { Stores } from "../models/model.store.js"
import { Users } from "../models/model.users.js"

export const __controlerStore = {
    bonentree: async (req, res, next) => {
        const trans = randomLongNumber({ length: 16 })
        const { items } = req.body
        const { phone: asphone, uuid, roles, __id, iat, exp, jti } = req.currentuser;

        if (!Array.isArray(items)) return Response(res, 401, "Items must be a type of array !")
        // console.log('====================================');
        // console.log(items);
        // console.log('====================================');
        try {
            const newItesms = []
            for (let index = 0; index < items.length; index++) {
                const { idproduit, qte, prixachat, prixunitaire, fournisseur, currency } = items[index];
                const prd = await Produits.findOne({
                    where: {
                        id: parseInt(idproduit)
                    }
                })
                if (prd instanceof Produits) {
                    const { prix, qte: asqte, idunity } = prd;
                    prd.update({
                        qte: parseInt(asqte) + parseInt(qte),
                        updatedon: now({ options: {} }),
                        prix: parseFloat(prixunitaire)
                    })
                    newItesms.push({
                        idproduit,
                        prix: parseFloat(prixunitaire),
                        prixachat: parseFloat(prixachat),
                        fournisseur,
                        qte_disponible: qte,
                        qte,
                        idunity
                    })
                }
            }
            Stores.create({
                transaction: trans,
                items: [...newItesms],
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
    getlateststore: async (req, res, next) => {
        try {
            Stores.findOne({
                where: {},
                order: [['id', 'DESC']],
                limit: 1
            })
                .then(async store => {
                    let { items } = store.toJSON();
                    items = Array.isArray(items) ? [...items] : JSON.parse(items)
                    const __ = []
                    for (let index = 0; index < items.length; index++) {
                        const { idproduit, idunity } = items[index];
                        const prd = await Produits.findOne({
                            where: {
                                id: idproduit
                            },
                            attributes: ['id', 'barcode', 'produit', 'currency', 'prix']
                        })
                        if (prd instanceof Produits) __.push({
                            ...items[index],
                            __tbl_produit: prd.toJSON(),
                            __tbl_unity: findUnityMesure({ idunity })
                        })
                    }
                    delete store['items'];
                    store['items'] = __
                    return Response(res, 200, store)
                })
                .catch(err => {
                    console.log(err);
                    return Response(res, 500, err)
                })
        } catch (error) {
            console.log(error);
            return Response(res, 500, error)
        }
    },
    getbyid: async (req, res, next) => {
        const { idapprovionement } = req.params;
        if (!idapprovionement) return Response(res, 401, "This request must have at least idapprovionement !")
        try {
            Stores.belongsTo(Users, { foreignKey: "createdby" })
            Stores.findOne({
                include: [
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'phone']
                    }
                ],
                where: {
                    id: parseInt(idapprovionement)
                },
            })
                .then(async store => {
                    if (store instanceof Stores) {
                        let { items } = store.toJSON();
                        items = Array.isArray(items) ? [...items] : JSON.parse(items)
                        const __ = []
                        for (let index = 0; index < items.length; index++) {
                            const { idproduit, idunity } = items[index];
                            const prd = await Produits.findOne({
                                where: {
                                    id: idproduit
                                },
                                attributes: ['id', 'barcode', 'produit', 'currency', 'prix', 'idcategory']
                            })
                            if (prd instanceof Produits) {
                                const { idcategory, barcode } = prd.toJSON()
                                const categ = await Categories.findOne({
                                    where: {
                                        id: idcategory
                                    }
                                })
                                __.push({
                                    ...items[index],
                                    barcode,
                                    __tbl_category: categ.toJSON(),
                                    __tbl_produit: prd.toJSON(),
                                    __tbl_unities: findUnityMesure({ idunity })
                                })
                            }
                        }
                        delete store['items'];
                        store['items'] = __
                        return Response(res, 200, store)
                    } else {
                        return Response(res, 200, {})
                    }
                })
                .catch(err => {
                    return Response(res, 503, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    list: async (req, res, next) => {
        try {
            Stores.belongsTo(Users, { foreignKey: 'createdby' })
            Stores.findAndCountAll({
                where: {},
                include: [
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'email', 'phone']
                    }
                ]
            })
                .then(({ rows, count }) => {
                    return Response(res, 200, { length: count, list: rows })
                })
                .catch(err => {
                    return Response(res, 503, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}