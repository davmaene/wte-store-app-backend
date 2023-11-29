import { Response } from "../helpers/helper.message.js";
import { Provinces } from "../models/model.provinces.js";

export const __controlerPronvinces = {
    
    liste: async (req, res, next) => {
        try {
            await Provinces.findAndCountAll({
                order: [
                    ['id', 'DESC'],
                ],
                where: {
                    status: 1
                }
            })
            .then(({ rows, count }) => {
                return Response(res, 200, { list: rows, length: count })
            })
            .catch(err => {
                return Response(res, 500, err)
            })
        } catch (error) {
            return Response(res, 500, error)
        }
    },
};