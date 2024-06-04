import { Response } from "../helpers/helper.message.js";

export const __controlerCaisse = {
    update: async (req, res, next) => {
        const { amount, currency } = req.body;
        if (!amount || !currency) return Response(res, 401, "This request must have at least amount !")
        try {
            
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}