import { capitalizeWords } from "../helpers/helper.helper.js"
import { Response } from "../helpers/helper.message.js"
import { Guichets as Laboratories } from "../models/model.guichets.js"
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
                        required: true
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
        
    }
}