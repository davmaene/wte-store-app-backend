import { addPersentToPrice, capitalizeWords, findUnityMesure } from "../helpers/helper.helper.js"
import { Response } from "../helpers/helper.message.js"
import { Categories } from "../models/model.categories.js";
import { Produits } from "../models/model.produits.js"
import { v4 as uuidv4 } from 'uuid';

export const __controlerProduits = {
    getonbycode: async (req, res, next) => {
        const { barcode } = req.params
        try {
            Categories.hasOne(Produits, { foreignKey: "idcategory" })
            Produits.belongsTo(Categories, { foreignKey: "idcategory" })

            Produits.findOne({
                where: {
                    barcode
                },
                // raw: true,
                include: [
                    {
                        model: Categories,
                        required: true,
                        attributes: ['id', 'category']
                    }
                ]
            })
                .then(({ rows, count }) => {
                    rows = rows.map(l => {
                        const { idunity } = l.toJSON()
                        return {
                            ...l.toJSON(),
                            __tbl_unities: findUnityMesure({ idunity })
                        }
                    })
                    return Response(res, 200, { list: rows, length: count })
                })
                .catch((err) => {
                    return Response(res, 503, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    list: async (req, res, next) => {
        try {

            Categories.hasOne(Produits, { foreignKey: "idcategory" })
            Produits.belongsTo(Categories, { foreignKey: "idcategory" })

            Produits.findAndCountAll({
                where: {},
                // raw: true,
                include: [
                    {
                        model: Categories,
                        required: true,
                        attributes: ['id', 'category']
                    }
                ]
            })
                .then(({ rows, count }) => {
                    rows = rows.map(l => {
                        const { idunity } = l.toJSON()
                        return {
                            ...l.toJSON(),
                            __tbl_unities: findUnityMesure({ idunity })
                        }
                    })
                    return Response(res, 200, { list: rows, length: count })
                })
                .catch((err) => {
                    return Response(res, 503, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    add: async (req, res, next) => {
        const {
            barcode,
            produit,
            idunity,
            idcategory,
            prix,
            currency,
            description
        } = req.body;
        if (!produit || !idcategory || !prix || !currency || !idunity)
            return Response(res, 401, "This request must have at least !produit || !idcategory || !prix || !currency || !description || !idunity")
        try {
            Produits.create({
                idunity,
                barcode,
                uuid: uuidv4(),
                produit: capitalizeWords({ text: produit }),
                idcategory: parseInt(idcategory),
                prix: parseFloat(prix),
                currency: String(currency).toUpperCase(),
                description
            })
                .then(prd => {
                    if (prd instanceof Produits) {
                        return Response(res, 200, prd)
                    } else {
                        return Response(res, 503, prd)
                    }
                })
                .catch(er => {
                    return Response(res, 503, er)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    update: async (req, res, next) => {
        const { idproduit } = req.params
        const {
            idunity,
            barcode,
            produit,
            idcategory,
            prix,
            currency,
            description
        } = req.body;
        if (Object.keys(req.body).length <= 0)
            return Response(res, 401, "This request must have at least !produit || !idcategory || !prix || !currency || !description")
        try {
            Produits.update({
                barcode,
                produit: capitalizeWords({ text: produit }),
                idcategory: parseInt(idcategory),
                prix: parseFloat(prix),
                currency: String(currency).toUpperCase(),
                description
            }, {
                where: {
                    id: idproduit
                }
            })
                .then(prd => {
                    if (prd) {
                        return Response(res, 200, prd)
                    } else {
                        return Response(res, 503, prd)
                    }
                })
                .catch(er => {
                    return Response(res, 503, er)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    delete: async (req, res, next) => {
        const { idproduit } = req.params;
        try {
            Produits.findOne({
                where: {
                    id: idproduit
                }
            })
                .then(prd => {
                    if (prd instanceof Produits) {
                        prd.destroy()
                            .then(d => Response(res, 200, "Item deleted"))
                            .catch(err => Response(res, 400, err))
                    } else {
                        return Response(res, 400, prd)
                    }
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}