import { Response } from "../helpers/helper.message.js"
import { Roles } from "../models/model.roles.js"

export const __controlerRole = {

    add: async (req, res, next) => {
        const { role } = req.body;
        try {
            Roles.create({
                role
            })
                .then(rol => {
                    if (rol instanceof Roles) {
                        return Response(res, 200, rol)
                    } else {
                        return Response(res, 400, rol)
                    }
                })
                .catch(err => {
                    return Response(res, 503, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    list: async (req, res, next) => {
        try {
            Roles.findAndCountAll({
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
    }
}