import { Response } from "../helpers/helper.message.js"
import { Territoires } from "../models/model.territoirs.js"

export const territoiresController = {

    addTerritoires: async (req, res) => {
        const { territoire } = req.body;
        if (!territoire) return Response(res, 401, "The field can not be empty");
        try {
            await Territoires.create({
                territoire: territoire,
            }).then(teritr => {
                if (teritr instanceof Territoires) return Response(res, 200, teritr)
                else return Response(res, 400, teritr)
            }).catch(err => {
                return Response(res, 500, err)
            })
        } catch (error){
            return Response(res, 500, error)
        }
    },
    listebyprovince: async (req, res, next) => {
        try {
            const { idprovince } = req.params;
            if(!idprovince) return Response(res, 401, "this request must have at least idprovince as parameter ")
            Territoires.findAndCountAll({
                order: [
                    ['id', 'DESC'],
                ],
                where: {
                    status: 1,
                    idprovince
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
    liste: async(req, res, next) => {
        try {
            Territoires.findAndCountAll({
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
    deleteTerritoire: async (req, res) => {
        try{
            await Territoires.destroy({
                where: {
                    id: req.params.id
                }
            }).then(deletetrtre => {
                if (deletetrtre) {
                    return Response(res, 200, req.params.id)
                }else{
                    return Response(res, 404, 'Server error, The item was not found' )
                }
            }).catch(err => {
                return Response(res, 500, err);
            })
        } catch (error) {
            return Response(res, 500, error);
        }
    },
    updateTerritoire: async (req, res) => {
        const { territoire } = req.body;
        try {
            await Territoires.findOne({
                where: {
                    id: req.params.id
                }
            }).then(updtterri => {
                if (updtterri) {
                    updtterri.update({
                        territoire,
                    }
                    ).then(finalUpdt => {
                        if (finalUpdt) {
                            return Response(res, 200, finalUpdt);
                        }
                    })
                } else {
                    return Response(res, 404, 'Server error, The item was not found' )
                }
            }).catch(err => {
                return Response(res, 500, err)
            })
        } catch (error) {
            return Response(res, 500, error);
        }
    },
}
