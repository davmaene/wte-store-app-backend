import { Response } from "../helpers/helper.message.js"
import { Guichets } from "../models/model.guichets.js"
import { GStores } from "../models/model.guichetstores.js"

export const __controlerGstore = {
    bonentree: async (req, res, next) => {

    },
    getstore: async (req, res, next) => {
        const { idguichet } = req.params
        try {

            GStores.hasOne(Guichets, { foreignKey: "idguichet" });
            Guichets.belongsTo(GStores, { foreignKey: "idguichet" });

            GStores.findOne({
                where: {
                    idguichet: parseInt(idguichet)
                }
            })
                .then(st => {
                    if (st instanceof GStores) {

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