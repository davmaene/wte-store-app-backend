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
        Config.findOne({
            where: {
                id: 1
            },
        })
            .then((isnew) => {
                if (isnew instanceof Config) {
                    isnew.update({
                        taux_change: parseFloat(taux_change),
                        commission_price: commission_price ? parseFloat(commission_price) : undefined
                    })
                        .then(__ => Response(res, 200, isnew))
                        .catch(__ => Response(res, 400, __))
                } else {
                    return Response(res, 400, isnew)
                }
            })
            .catch((err) => {
                return Response(res, 500, err)
            });
    },
    convertdevise: async (req, res, next) => {
        
    }
}