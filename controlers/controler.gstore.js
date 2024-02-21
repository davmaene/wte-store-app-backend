import { Response } from "../helpers/helper.message.js"
import { Guichets } from "../models/model.guichets.js"
import { GStores } from "../models/model.guichetstores.js"

export const __controlerGstore = {
    bonentree: async (req, res, next) => {
        const { items } = req.body;
        if (!items) return Response(res, 401, "This request must have at least items as paramter !")
        try {

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