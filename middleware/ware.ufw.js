import { Response } from "../helpers/helper.message.js";
import { exludedRoutes, onVerify } from "./ware.cookies.js";
import dotenv from 'dotenv';

dotenv.config();

const { CONNEXIONTOAPPWEB, CONNEXIONTOAPPMOB } = process.env;

export const accessValidator = (req, res, next) => {
    const { headers, url } = req;
    if (headers && url) {

        if (exludedRoutes.indexOf(url) === -1) {
            if (headers && headers.hasOwnProperty(CONNEXIONTOAPPWEB)) {
                
                const authorization = headers[CONNEXIONTOAPPWEB];
                const _isfrom_mob = headers[CONNEXIONTOAPPMOB];
                const { apikey, accesskey } = headers;

                if (authorization && authorization.includes("Bearer ")) {
                    if (_isfrom_mob === 'true' || _isfrom_mob === true) return next();

                    onVerify({
                        token: authorization.split(" ")[1].trim() || "",
                        next,
                        req,
                        res
                    }, (err, done) => {
                        if (done) {
                            req.currentuser = { ...done };
                            return next();
                        } else {
                            return Response(res, 403, "Your Token has expired !")
                        }
                    })

                } else return Response(res, 403, "Your don't have access to this ressource !")
            } else {
                return Response(res, 403, "Your don't have access to this ressource !")
            }
        } else {
            return next()
        }
    } else return Response(res, 403, "Your don't have access to this ressource !")
}