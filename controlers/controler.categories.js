import { capitalizeWords } from "../helpers/helper.helper.js"
import { Response } from "../helpers/helper.message.js"
import { Categories } from "../models/model.categories.js"

export const __controlerCategories = {
    list: async (req, res, next) => {
        try {
            Categories.findAndCountAll({
                where: {
                    status: 1
                }
            })
                .then(({ rows, count }) => {
                    return Response(res, 200, { length: count, list: rows })
                })
                .catch(err => {
                    return Response(res, 500, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    add: async (req, res, next) => {
        const { category } = req.body
        try {
            Categories.create({
                category: capitalizeWords({ text: category })
            })
                .then(categ => {
                    if (categ instanceof Categories) {
                        return Response(res, 200, categ)
                    } else {
                        return Response(res, 400, {})
                    }
                })
                .catch(err => {
                    return Response(res, 500, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}