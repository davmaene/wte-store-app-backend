import { unityMesure } from "../helpers/helper.helper.js"
import { Response } from "../helpers/helper.message.js"

export const __controlerUnities = {
    list: async (req, res, next) => {
        try {
            return Response(res, 200, { length: unityMesure.length, list: unityMesure })
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}