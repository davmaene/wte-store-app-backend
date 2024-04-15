import { capitalizeWords, findUnityMesure } from "../helpers/helper.helper.js"
import { Response } from "../helpers/helper.message.js"
import { Categories } from "../models/model.categories.js"
import { Guichets, Guichets as Laboratories } from "../models/model.guichets.js"
import { GStores } from "../models/model.guichetstores.js"
import { Produits } from "../models/model.produits.js"
import { Provinces } from "../models/model.provinces.js"
import { Territoires } from "../models/model.territoirs.js"
import { Users } from "../models/model.users.js"
import { Services } from "../services/services.all.js"

export const __controlerLaoratories = {

    list: async (req, res, next) => {
        try {
            Users.hasOne(Laboratories, { foreignKey: "id" });
            Laboratories.belongsTo(Users, { foreignKey: "idresponsable" });

            Provinces.hasOne(Laboratories, { foreignKey: "id" });
            Laboratories.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Laboratories, { foreignKey: "id" });
            Laboratories.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Laboratories.findAndCountAll({
                where: {
                    status: 1
                },
                include: [
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'email', 'phone']
                    },
                    {
                        model: Provinces,
                        required: true
                    },
                    {
                        model: Territoires,
                        required: true
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
    },
    addusertoguichet: async (req, res, next) => {
        const { iduser, idguichet } = req.body;
        if (!iduser || !idguichet) return Response(res, 401, "This request must have at least !iduser || !idguichet")
        try {
            Services.addUserToGuichet({
                input: {
                    idguichet,
                    iduser
                },
                transaction: null,
                cb: (err, done) => {
                    console.log(done, err);
                    if (done) {
                        const { code, message, data } = done
                        if (code === 200) {
                            return Response(res, 200, data)
                        } else {
                            return Response(res, 400, err)
                        }
                    } else {
                        return Response(res, 500, err)
                    }
                }
            })
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    add: async (req, res, next) => {
        const { guichet, description, adresse, idprovince, idterritoire, idresponsable, idvillage } = req.body;
        try {
            Laboratories.create({
                guichet: capitalizeWords({ text: guichet }),
                description,
                adresse,
                idprovince,
                idterritoire,
                idvillage,
                idresponsable
            })
                .then(lb => {
                    if (lb instanceof Laboratories) return Response(res, 200, lb)
                    else return Response(res, 400, lb)
                })
                .catch(err => {
                    return Response(res, 503, err)
                })
        } catch (error) {
            console.log(error);
            return Response(res, 500, error)
        }
    },
    getonbyid: async (req, res, next) => {
        const { idguichet } = req.params;
        if (!idguichet) return Response(res, 401, "This request must have at least idguichet !")
        try {
            Users.hasOne(Laboratories, { foreignKey: "id" });
            Laboratories.belongsTo(Users, { foreignKey: "idresponsable" });

            Provinces.hasOne(Laboratories, { foreignKey: "id" });
            Laboratories.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Laboratories, { foreignKey: "id" });
            Laboratories.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Laboratories.findOne({
                where: {
                    status: 1,
                    id: parseInt(idguichet)
                },
                include: [
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'nom', 'postnom', 'prenom', 'email', 'phone']
                    },
                    {
                        model: Provinces,
                        required: true
                    },
                    {
                        model: Territoires,
                        required: true
                    }
                ]
            })
                .then((guichet) => {
                    if (guichet instanceof Guichets) {
                        GStores.findOne({
                            where: {
                                idguichet: parseInt(idguichet)
                            }
                        })
                            .then(async st => {
                                if (st instanceof GStores) {
                                    let { items } = st.toJSON();
                                    items = Array.isArray(items) ? [...items] : JSON.parse(items)
                                    const produits = []
                                    for (let index = 0; index < items.length; index++) {
                                        const { idproduit, qte } = items[index];
                                        let prd = await Produits.findOne({
                                            where: {
                                                id: parseInt(idproduit),
                                            },
                                            attributes: ['id', 'prix', 'produit', 'currency', 'description', 'uuid', 'idcategory', 'idunity', 'barcode']
                                        })
                                        if (prd instanceof Produits) {
                                            prd = prd.toJSON()
                                            const { idcategory, idunity } = prd;

                                            const categ = await Categories.findOne({
                                                where: {
                                                    id: parseInt(idcategory)
                                                }
                                            });

                                            produits.push({
                                                ...prd,
                                                qte,
                                                __tbl_category: categ ? categ.toJSON() : null,
                                                __tbl_unities: findUnityMesure({ idunity })
                                            });
                                        }
                                    }
                                    st = st.toJSON()
                                    guichet = guichet.toJSON()
                                    delete st['items']
                                    return Response(res, 200, { ...guichet, __tbl_gstore: st, __tbl_produits: produits })
                                } else {
                                    return Response(res, 200, { __tbl_gstore: {}, __tbl_produits: [] })
                                }
                            })
                            .catch(er => {
                                return Response(res, 503, er)
                            })
                    } else {
                        return Response(res, 200, { __tbl_gstore: {}, __tbl_produits: [] })
                    }
                })
                .catch(err => {
                    console.log('====================================');
                    console.log("Two ==> ", err);
                    console.log('====================================');
                    return Response(res, 503, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    delete: async (req, res, next) => {
        const { idboutique } = req.params;
        if (!idboutique) return Response(res, 401, "This request must have at least !idboutiques")
        try {
            Guichets.findOne({
                where: {
                    id: idboutique
                }
            })
                .then(btq => {
                    if (btq instanceof Guichets) {
                        btq.destroy()
                        return Response(res, 200, `Item with id ${idboutique} was successfuly deleted !`)
                    }
                })
                .catch(err => {
                    return Response(res, 500, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}