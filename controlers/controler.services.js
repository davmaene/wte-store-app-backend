import { Response } from "../helpers/helper.message.js";
import { Services } from "../services/services.all.js";

export const __controlerServices = {
    onsendmail: async (req, res, next) => {
        const { to, content } = req.body;
        Services.onSendMail({
            to,
            content,
            cb: (err, done) => {
                const { code, message, data } = done;
                if(code === 200) return Response(res, 200, "Mail successfuly sent !");
                else return Response(res, 500, "Error on send mail !")
            }
        })
    }
}