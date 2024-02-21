import { capitalizeWords } from "../helpers/helper.helper.js"
import { Response } from "../helpers/helper.message.js"
import { Produits } from "../models/model.produits.js"

export const __controlerProduits = {
    list: async (req, res, next) => {
        try {
            Produits.findAndCountAll({
                where: {}
            })
                .then(({ rows, count }) => {
                    return Response(res, 200, { list: rows, length: count })
                })
                .catch((err) => {
                    return Response(res, 503, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    
    add: async (req, res, next) => {
        const {
            produit,
            idcategory,
            prix,
            currency,
            description
        } = req.body;
        if(!produit || !idcategory || !prix || !currency || !description)
        return Response(res, 401, "This request must have at least !produit || !idcategory || !prix || !currency || !description")
        try {
            Produits.create({
                produit: capitalizeWords({ text: produit }),
                idcategory: parseInt(idcategory),
                prix: parseFloat(prix),
                currency: String(currency).toUpperCase(),
                description
            })
            .then(prd => {
                if(prd instanceof Produits){
                    return Response(res, 200, prd)
                }else{
                    return Response(res, 503, prd)
                }
            })
            .catch(er => {
                return Response(res, 503, er)
            })
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}