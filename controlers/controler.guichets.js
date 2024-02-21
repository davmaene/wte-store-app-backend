import { capitalizeWords } from "../helpers/helper.helper.js"
import { Response } from "../helpers/helper.message.js"
import { Laboratories } from "../models/model.guichets.js"

export const __controlerLaoratories = {
    
    list: async (req, res, next) => {
        try {
            Laboratories.findAndCountAll({
                where: {
                    status: 1
                }
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
                    console.log(err);
                    return Response(res, 503, err)
                })
        } catch (error) {
            console.log(error);
            return Response(res, 500, error)
        }
    }
}