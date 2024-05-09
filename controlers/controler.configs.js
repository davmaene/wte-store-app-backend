import { capitalizeWords } from "../helpers/helper.helper";
import { Response } from "../helpers/helper.message.js"
import { Charges } from "../models/model.chages.js";

export const __controlerConfigs = {
    addcharge: async (req, res, next) => {
        const { charges, cout, currency } = req.body;
        if (!charges || !cout) return Response(res, 401, "This request must have at least !charges || !cout")
        try {
            Charges.create({
                charges: capitalizeWords({ text: charges }),
                currency,
                cout: parseFloat(cout)
            })
                .then(cout_ => {
                    if (cout_ instanceof Charges) {
                        return Response(res, 200, cout_)
                    } else {
                        return Response(res, 400, cout_)
                    }
                })
                .catch(err => {
                    return Response(res, 500, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    deletecharge: async (req, res, next) => {

    }
}