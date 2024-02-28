import { Response } from "../helpers/helper.message"
import { Ventes } from "../models/model.ventes"

export const __controlerVentes = {
    listall: async (req, res, next) => {
        try {
            Ventes.findAndCountAll({
                where: {
                    status: 1
                }
            })
                .then((rows, count) => {
                    return Response(res, 200, { list: rows, length: count })
                })
                .catch(err => {
                    return Response(res, 500, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    listbyguichet: async (req, res, next) => {
        const { idguichet } = req.params
        try {
            Ventes.findAndCountAll({
                where: {
                    status: 1
                }
            })
                .then((rows, count) => {
                    return Response(res, 200, { list: rows, length: count })
                })
                .catch(err => {
                    return Response(res, 500, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}