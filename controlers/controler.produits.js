import { Response } from "../helpers/helper.message.js"
import { Produits } from "../models/model.produits.js"

export const __controlerProduits = {
    list: async (req, res, next) => {
        try {
            Produits.findAndCountAll({
                where: {

                }
            })
                .then(({ rows, count }) => {
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

    }
}