import { converterDevise, renderAsLisibleNumber } from "../helpers/helper.helper.js";
import { Response } from "../helpers/helper.message.js";
import { Caisses } from "../models/model.caisse.js";

export const __controlerCaisse = {
    getassome: async (req, res, next) => {
        try {
            Caisses.findAll({
                where: {
                    status: 1
                }
            })
                .then(async cs => {
                    const caisse = [0, 0, ...Array.from(cs).map(c => c['amount'])]
                    const { code, message, data } = await converterDevise({
                        amount: caisse.reduce((p, n) => parseFloat(p) + parseFloat(n)),
                        currency: "CDF"
                    })
                    if (code === 200) {
                        const { amount, currency } = data
                        return Response(res, 200, { amount: renderAsLisibleNumber({ nombre: amount }), currency } || { currency: "CDF", amount: 0 })
                    } else {
                        return Response(res, 200, { currency: "CDF", amount: 0 })
                    }
                })
                .catch(err => Response(res, 500, err))
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    gatforguichet: async (req, res, next) => {
        const { idguichet } = req.params
        if (!idguichet) return Response(res, 401, "This request must have at least idguichet ")
        try {
            Caisses.findOne({
                where: {
                    idguichet
                }
            })
                .then(cs => {
                    return Response(res, 200, cs)
                })
                .catch(err => Response(res, 500, err))
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    update: async (req, res, next) => {
        const { amount, currency } = req.body;
        if (!amount || !currency) return Response(res, 401, "This request must have at least amount !")
        try {

        } catch (error) {
            return Response(res, 500, error)
        }
    }
}