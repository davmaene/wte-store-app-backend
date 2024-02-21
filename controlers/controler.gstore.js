import { Response } from "../helpers/helper.message.js"

export const __controlerGstore = {
    bonentree: async (req, res, next) => {

    },
    getstore: async (req, res, next) => {
        const { idguichet } = req.bodym
        try {
            
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}