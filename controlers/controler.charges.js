import { capitalizeWords } from "../helpers/helper.helper.js";
import { Response } from "../helpers/helper.message.js"
import { Charges } from "../models/model.chages.js";

export const __controlerChages = {
    addcharge: async (req, res, next) => {
        const { charge, cout, currency, manytimes } = req.body;
        if (!charge || !cout) return Response(res, 401, "This request must have at least !charges || !cout")
        try {
            Charges.create({
                charges: capitalizeWords({ text: charge }),
                currency,
                cout: parseFloat(cout),
                manytimes
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