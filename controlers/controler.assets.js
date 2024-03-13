import { Response } from "../helpers/helper.message.js"
import path from 'path';
import { ServiceImage } from "../services/services.images.js";
import { Users } from "../models/model.users.js";

export const __controlerAssets = {
    getressoursesavatar: async (req, res, next) => {
        const { ressources } = req.params;
        const folder = "as_avatar";
        try {
            return res
                .status(200)
                .sendFile(path.resolve(`assets/${folder}/${ressources}`), (error) => {
                    if (error) {
                        console.log(`no ressource found with the name | Profile | : ${ressources}`);
                        return res.sendFile(path.resolve(`assets/${folder}/defaultavatar.png`));
                    }
                });
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    getressourses: async (req, res, next) => {
        const { ressources } = req.params;
        const folder = "as_assets";
        try {
            return res
                .status(200)
                .sendFile(path.resolve(`assets/${folder}/${ressources}`), (error) => {
                    if (error) {
                        console.log(`no ressource found with the name | Profile | : ${ressources}`);
                        return res.sendFile(path.resolve(`assets/${folder}/defaultavatar.png`));
                    }
                });
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    getanyressourses: async (req, res, next) => {
        const { ressources } = req.params;
        const folder = "as_assets";
        try {
            return res
                .status(200)
                .sendFile(path.resolve(`assets/${folder}/${ressources}`), (error) => {
                    if (error) {
                        console.log(`no ressource found with the name | Profile | : ${ressources}`);
                        return res.sendFile(path.resolve(`assets/${folder}/defaultavatar.png`));
                    }
                });
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    getressoursesasproduct: async (req, res, next) => {
        const { ressources } = req.params;
        const folder = "as_products";
        try {
            return res
                .status(200)
                .sendFile(path.resolve(`assets/${folder}/${ressources}`), (error) => {
                    if (error) {
                        console.log(`no ressource found with the name | Product | : ${ressources}`);
                        return res.sendFile(path.resolve(`assets/${folder}/defaultproduit.jpg`));
                    }
                });
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    setressourcesasavatar: async (req, res, next) => {
        const { iduser } = req.body;
        const { avatar } = req.files;
        if (!iduser || !avatar) return Response(res, 401, "This request must have at least iduser and avatar")
        try {
            const user = await Users.findOne({
                where: {
                    id: parseInt(iduser)
                }
            })
            if (user instanceof Users) {
                ServiceImage.onUploadImage({
                    inputs: {
                        file: req,
                        type: 'avatar'
                    },
                    callBack: (err, done) => {
                        if (done) {
                            const { code, message, data } = done;
                            ServiceImage.onRemoveBGFromImage({
                                inputs: {
                                    ...data,
                                    directory: 'as_avatar'
                                },
                                callBack: (er, success) => {
                                    if (success) {
                                        const { code, message, data } = success;
                                        if (code === 200) {
                                            const { filename, path } = data;
                                            user.update({
                                                avatar: path
                                            })
                                            return Response(res, 200, data)
                                        } else {
                                            return Response(res, 400, "Failed to remove bg to the file sorry !")
                                        }
                                    } else {
                                        return Response(res, 500, er)
                                    }
                                }
                            })

                        } else {
                            return Response(res, 400, "Bad request was sent into procedur !")
                        }
                    }
                })
            } else {
                return Response(res, 404, {
                    message: `User with ID ${iduser} was not found on this server`,
                    user
                })
            }
        } catch (error) {
            return Response(res, 500, error)
        }
    },
    setressourcesasproduct: async (req, res, next) => {
        const { idproduit } = req.body;
        const { product } = req.files;
        if (!idproduit || !product) return Response(res, 401, "This request must have at least idproduit and avatar")
        try {
            ServiceImage.onUploadImage({
                inputs: {
                    file: req,
                    type: 'product'
                },
                callBack: (err, done) => {
                    if (done) {
                        const { code, message, data } = done;
                        ServiceImage.onRemoveBGFromImage({
                            inputs: {
                                ...data,
                                directory: 'as_products'
                            },
                            callBack: (er, success) => {
                                if (success) {
                                    const { code, message, data } = success;
                                    if (code === 200) {
                                        return Response(res, 200, data)
                                    } else {
                                        return Response(res, 400, "Failed to remove bg to the file sorry !")
                                    }
                                } else {
                                    return Response(res, 500, er)
                                }
                            }
                        })

                    } else {
                        return Response(res, 400, "Bad request was sent into procedur !")
                    }
                }
            })
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}