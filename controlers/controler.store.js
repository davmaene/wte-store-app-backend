import { Configs } from "../configs/configs.js"
import { Response } from "../helpers/helper.message.js"
import { randomLongNumber } from "../helpers/helper.random.js"

export const __controlerStore = {
    bonentree: async (req, res, next) => {
        const trans = randomLongNumber({ length: 6 })
        const { items } = req.body
        if(!Array.isArray(items)) return Response(res, 401, "Items must be a type of array !")

        try {
            
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    bonsortie: async (req, res, next) => {

    }
}