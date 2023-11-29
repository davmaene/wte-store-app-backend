import { Response } from "../helpers/helper.message.js"
import { Villages } from "../models/model.villages.js"

export const villageController = {

    addvillage: async (req, res) => {

        const { village, idgroupement } = req.body;
        if(!village || !idgroupement) return Response(res, 401, "this request must have village name and idgroupement")

        try {
            await Villages.create({
                village: village,
                idgroupement: idgroupement,
            })
            .then(vlge => {
                if(vlge instanceof Villages) return Response(res, 200, vlge)
                else return Response(res, 400, vlge)
            })
            .catch(err => {
                return Response(res, 503, err)
            })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    liste: async (req, res, next) => {

        try {
            // Groupements.hasOne(Villages, { foreignKey: "idgroupement" });
            // Villages.belongsTo(Groupements, { foreignKey: "id" })
            
            Villages.findAndCountAll({
                order: [
                    ['id', 'DESC'],
                ],
                where: {
                    status: 1
                }
            })
            .then(({ rows, count }) => {
                return Response(res, 200, { liste: rows, length: count })
            })
            .catch(err => {
                return Response(res, 500, err)
            })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    getvillagebycoords: async (req, res, next) => {

        const { lat, long } = req.body;
        if(!lat || !long) return Response(res, 401, "This request must have at least latitude and longitude as params !");
        try {
            await Villages.findOne({
                where: {
                    latitude: lat,
                    longitude: long
                }
            })
            .then(village => {
                if(village instanceof Villages) return Response(res, 200, village);
                else return Response(res, 400, village);
            })
            .catch(err => {
                return Response(res, 400, err)
            })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    listebyterritoire: async (req, res, next) => {

        try {
            const { idterritoire } = req.params;
            if(!idterritoire) return Response(res, 401, "this request must have at least idterritory !")
            // Groupements.hasOne(Villages, { foreignKey: "idgroupement" });
            // Villages.belongsTo(Groupements, { foreignKey: "id" })
            
            Villages.findAndCountAll({
                order: [
                    ['id', 'DESC'],
                ],
                where: {
                    status: 1,
                    territoire: idterritoire
                },
                // include: [
                //     {
                //         model: Groupements,
                //         required: false,
                //     }
                // ]
            })
            .then(({ rows, count }) => {
                return Response(res, 200, { liste: rows, length: count })
            })
            .catch(err => {
                return Response(res, 500, err)
            })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    deleteVillage: async (req, res) => {
        try {
            await Villages.destroy({
                where: {
                    id: req.params.id
                }
            }).then(deleteVlg => {
                if (deleteVlg) {
                    return Response(res, 200, req.params.id)
                } else {
                    return Response(res, 404, 'Server error, The item was not found')
                }
            }).catch(err => {
                return Response(res, 500, err);
            })
        } catch (error) {
            return Response(res, 500, error);
        }
    },

    updateVillage: async (req, res) => {
        const { village } = req.body;
        try {
            await Villages.findOne({
                where: {
                    id: req.params.id
                }
            }).then(updateVlg => {
                if (updateVlg) {
                    updateVlg.update({
                        village,
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
