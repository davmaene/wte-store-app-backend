import { addPersentToPrice, capitalizeWords, converterDevise, findUnityMesure } from "../helpers/helper.helper.js"
import { Response } from "../helpers/helper.message.js"
import { Categories } from "../models/model.categories.js";
import { Produits } from "../models/model.produits.js"
import { v4 as uuidv4 } from 'uuid';
import { ServiceImage } from "../services/services.images.js";
import { GStores } from "../models/model.guichetstores.js";
import { Guichets } from "../models/model.guichets.js";

export const __controlerProduits = {
    getonbycodeinstore: async (req, res, next) => { // get one product by codebar
        const { barcode } = req.params
        const { phone: asphone, uuid, roles, __id, iat, exp, jti, idguichet } = req.currentuser;
        if (!barcode) return Response(res, 401, "This request must have at least barcode !");
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
                        let { items } = st;
                        items = Array.isArray(items) ? [...items] : JSON.parse(items)
                        const produits = []
                        for (let index = 0; index < items.length; index++) {
                            const { idproduit, qte, prix } = items[index];
                            Categories.hasOne(Produits, { foreignKey: "idcategory" })
                            Produits.belongsTo(Categories, { foreignKey: "idcategory" })
                            let prd = await Produits.findOne({
                                include: [
                                    {
                                        model: Categories,
                                        required: true,
                                        attributes: ['id', 'category']
                                    }
                                ],
                                where: {
                                    barcode,
                                    id: parseInt(idproduit),
                                },
                                // attributes: ['id', 'prix', 'barcode', 'produit', 'currency', 'description', 'uuid']
                            })
                            if (prd instanceof Produits) {
                                prd = prd.toJSON()
                                const { idunity, currency, prix } = prd;
                                const { code, data, message } = await converterDevise({ amount: prix, currency });
                                const { amount, currency: ascurrency } = data;
                                produits.push({
                                    ...prd,
                                    qte,
                                    prix: amount,
                                    currency: ascurrency,
                                    __tbl_unities: findUnityMesure({ idunity })
                                });
                            }
                        }
                        if (produits.length > 0) {
                            // st = st.toJSON()
                            // delete st['items']
                            return Response(res, 200, { ...produits[0] })
                        } else {
                            return Response(res, 404, {})
                        }
                    } else {
                        return Response(res, 404, {})
                    }
                })
                .catch(er => {
                    return Response(res, 503, er)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    getonbycode: async (req, res, next) => {
        const { barcode } = req.params
        try {
            Categories.hasOne(Produits, { foreignKey: "idcategory" })
            Produits.belongsTo(Categories, { foreignKey: "idcategory" })

            Produits.findOne({
                where: {
                    barcode
                },
                include: [
                    {
                        model: Categories,
                        required: true,
                        attributes: ['id', 'category']
                    }
                ]
            })
                .then(async row => {
                    if (row instanceof Produits) {
                        const { idunity, currency, prix } = row.toJSON();
                        console.log("===================================> Row when trying to buy ==> ", row);
                        const v = await converterDevise({
                            amount: prix,
                            currency
                        })
                        const { code, message, data } = v;
                        const { currency: ascurrency, amount: asamount } = data;
                        return Response(res, 200, {
                            ...row.toJSON(),
                            prix: asamount,
                            currency: ascurrency,
                            __tbl_unities: findUnityMesure({ idunity })
                        })
                    } else {
                        return Response(res, 404, row)
                    }
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
            description,
            niveaudalert
        } = req.body;

        if (!produit || !idcategory || !prix || !currency || !idunity || !niveaudalert) return Response(res, 401, "This request must have at least !produit || !idcategory || !prix || !currency || !description || !idunity || !niveaudalert")
        if (!req.files) return Response(res, 401, "This request must have at least image in body !")
        try {
            const hasbarcode = barcode ? 1 : 0
            ServiceImage.onUploadImage({
                inputs: {
                    file: req,
                    type: 'image'
                },
                callBack: (err, done) => {
                    if (done) {
                        const { code, message, data } = done;
                        ServiceImage.onRemoveBGFromImage({
                            inputs: {
                                ...data,
                                directory: 'as_products'
                            },
                            callBack: (er, success) => {
                                if (success) {
                                    const { code, message, data } = success;
                                    if (code === 200) {
                                        const { filename, path } = data
                                        Produits.create({
                                            image: path,
                                            hasbarcode,
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
                                    }
                                }
                            }
                        })
                    }
                }
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
                description,
                ...req.body,
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