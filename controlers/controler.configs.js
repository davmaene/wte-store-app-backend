import { Response } from "../helpers/helper.message.js";
import { Config } from "../models/model.configs.js"

export const __controlerConfigs = {
    getconfigs: async (req, res, next) => {
        Config.findOne({
            where: {}
        })
            .then((result) => {
                return Response(res, 200, result)
            })
            .catch((err) => {
                return Response(res, 500, err)
            });
    },
    update: async (req, res, next) => {
        const { taux_change, commission_price } = req.body
        if (!taux_change) return Response(res, 401, "this request must have at least commission_price as taux_change as params !")
        Config.findOrCreate({
            where: {
                id: 1
            },
            defaults: {
                taux_change: parseFloat(taux_change),
                commission_price
            }
        })
            .then(([result, isnew]) => {
                return Response(res, 200, result)
            })
            .catch((err) => {
                return Response(res, 500, err)
            });
    },
    convertdevise: async (req, res, next) => {

    }
}