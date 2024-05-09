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
        const { idcharge } = req.params;
        if (!idcharge) return Response(res, 401, "This request must have at least idchage !")
        try {
            Charges.findOne({
                where: {
                    id: idcharge
                }
            })
                .then(charge => {
                    if (charge instanceof Charges) {
                        charge.destroy()
                            .then(_ => Response(res, 200, `The item with id ${idcharge}`))
                            .catch(__ => Response(res, 404, `Item with id ${idcharge} was not found in this server !`))
                    } else {
                        return Response(res, 404, `Item with id ${idcharge} was not found in this server !`)
                    }
                })
                .catch(__ => Response(res, 404, `Item with id ${idcharge} was not found in this server !`))
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    update: async (req, res, next) => {
        const { idcharge } = req.params;
        const { charge, cout, currency, manytimes } = req.body;
        if (!idcharge) return Response(res, 401, "This request must have at least idchage !")
        try {
            Charges.findOne({
                where: {
                    id: idcharge
                }
            })
                .then(charge => {
                    if (charge instanceof Charges) {
                        charge.update({
                            charges: charge,
                            cout,
                            currency,
                            manytimes
                        })
                            .then(_ => Response(res, 200, `Item with id ${idcharge}`))
                            .catch(__ => Response(res, 404, `Item with id ${idcharge} was not found in this server !`))
                    } else {
                        return Response(res, 404, `Item with id ${idcharge} was not found in this server !`)
                    }
                })
                .catch(__ => Response(res, 404, `Item with id ${idcharge} was not found in this server !`))
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    list: async (req, res, next) => {
        try {
            Charges.findAll({
                where: {
                    status: 1
                }
            })
                .then(list => {
                    return Response(res, 200, { length: list.length, list })
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}