import { capitalizeWords } from "../helpers/helper.helper.js";
import { Response } from "../helpers/helper.message.js"
import { Subcategories } from "../models/model.subcategories.js"

export const __controlerSubcategories = {
    add: async (req, res, next) => {
        const { subcategory, idcategory } = req.body;
        try {
            Subcategories.create({
                subcategory: capitalizeWords({ text: subcategory }),
                idcategory: parseInt(idcategory)
            })
                .then(sub => {
                    if (sub instanceof Subcategories) {
                        return Response(res, 200, sub)
                    } else {
                        return Response(res, 400, sub)
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
            Subcategories.findAndCountAll({
                where: {
                    status: 1
                }
            })
                .then(({ count, rows }) => {
                    return Response(res, 200, { length: count, list: rows })
                })
                .catch(err => {
                    return Response(res, 500, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}