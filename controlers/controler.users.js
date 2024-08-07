import { fillphone } from "../helpers/helper.fillphone.js";
import { capitalizeWords, formatUserModel } from "../helpers/helper.helper.js";
import { Response } from "../helpers/helper.message.js"
import { comparePWD, hashPWD } from "../helpers/helper.password.js";
import { randomLongNumber } from "../helpers/helper.random.js";
import { Hasrole } from "../models/model.relations.js";
import { Roles } from "../models/model.roles.js";
import { Users } from "../models/model.users.js"
import { Services } from "../services/services.all.js";
import { Configs } from "../configs/configs.js";
import { Provinces } from "../models/model.provinces.js";
import { Territoires } from "../models/model.territoirs.js";
import { Villages } from "../models/model.villages.js";
import { Middleware } from "../middleware/ware.cookies.js";
import { v4 as uuidv4 } from 'uuid';
import { now } from "../helpers/helper.moment.js";
import { Op, where } from "sequelize";
import { Guichets } from "../models/model.guichets.js";

export const __controlerUsers = {

    signup: async (req, res, next) => {

        const { nom, postnom, prenom, email, phone, adresse, idprovince, idterritoire, idvillage, idlabo, genre, password, avatar, idrole, idguichet, isfromweb } = req.body;

        const pwd = await hashPWD({ plaintext: password });
        const code_ = randomLongNumber({ length: 6 });
        const uuid = uuidv4();

        try {

            const guichet = await Guichets.findOne({
                where: {
                    id: idguichet
                }
            })

            if (guichet instanceof Guichets) {
                const transaction = await Configs.transaction();
                Users.create({
                    uuid,
                    nom: capitalizeWords({ text: nom }),
                    postnom: capitalizeWords({ text: postnom }),
                    prenom: prenom ? capitalizeWords({ text: prenom }) : null,
                    email,
                    phone: fillphone({ phone }),
                    adresse,
                    idprovince,
                    idterritoire,
                    idvillage,
                    idlabo,
                    genre,
                    idguichet,
                    password: pwd,
                    isvalidated: 1,
                    verificationcode: code_
                }, { transaction })
                    .then(user => {
                        if (user instanceof Users) {

                            user = user.toJSON();
                            delete user['password'];
                            delete user['status'];
                            delete user['idprovince'];
                            delete user['idterritoire'];
                            delete user['idvillage'];
                            delete user['verificationcode'];
                            delete user['isvalidated'];

                            Services.addRoleToUser({
                                input: {
                                    idrole,
                                    iduser: user && user['id']
                                },
                                transaction,
                                cb: (err, done) => {
                                    if (done) {
                                        const { code } = done;
                                        if (code === 200) {
                                            // WTE-${code_} \nBonjour ${capitalizeWords({ text: nom })} votre compte a été crée avec succès. Ceci est votre code de vérification
                                            Services.onSendSMS({
                                                to: fillphone({ phone }),
                                                content: `Bonjour ${capitalizeWords({ text: nom })}, compte crée avec succès; votre mot de passe est ${password}`,
                                                cb: (err, done) => { }
                                            });

                                            transaction.commit()
                                            return Response(res, 200, { user, code: code_ })
                                        } else {
                                            transaction.rollback()
                                            return Response(res, 400, "Role not initialized correctly !")
                                        }
                                    } else {
                                        transaction.rollback()
                                        return Response(res, 400, "Role not initialized correctly !")
                                    }
                                }
                            })
                        } else return Response(res, 400, user)
                    })
                    .catch(err => {
                        transaction.rollback()
                        const { name, errors } = err;
                        const { message } = errors[0];
                        return Response(res, 503, { name, error: message })
                    })
            } else {
                return Response(res, 404, `${idguichet} does not match in guichet in the guichet's list !`)
            }

        } catch (error) {
            return Response(res, 500, error)
        }
    },

    signin: async (req, res, next) => {
        const { phone, password } = req.body;

        try {

            const transaction = await Configs.transaction();

            Users.belongsToMany(Roles, { through: Hasrole, attributes: ['id'] });
            Roles.belongsToMany(Users, { through: Hasrole, attributes: ['id'] });

            Provinces.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Villages.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Villages, { foreignKey: "idvillage" });

            Guichets.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Guichets, { foreignKey: "idguichet" });

            Users.findOne({
                where: {
                    status: 1,
                    [Op.or]: [
                        { email: phone },
                        { phone: fillphone({ phone }) }
                    ]
                },
                include: [
                    {
                        model: Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: Guichets,
                        required: true,
                        attributes: ['id', 'guichet', 'adresse']
                    },
                    {
                        model: Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: Villages,
                        required: false,
                        attributes: ['id', 'territoire']
                    }
                ]
            }, { transaction })
                .then(user => {
                    if (user instanceof Users) {
                        if (parseInt(user['isvalidated']) === 1) {
                            comparePWD({
                                hashedtext: user && user['password'],
                                plaintext: password
                            }, (err, verified) => {
                                if (verified) {
                                    let roles = user && user['__tbl_roles'];
                                    roles = Array.from(roles).map(r => r && r['id'])
                                    Middleware.onSignin({
                                        data: {
                                            phone: user && user['phone'],
                                            uuid: user && user['uuid'],
                                            roles,
                                            __id: user && user['id'],
                                            idguichet: user && user['idguichet']
                                        }
                                    }, (err, token) => {
                                        if (token) {

                                            user.update({
                                                lastlogin: now({ options: {} })
                                            })

                                            user = user.toJSON()
                                            user = formatUserModel({ model: user })
                                            delete user['isvalidated']
                                            delete user['verificationcode']
                                            delete user['status']
                                            delete user['lastlogin']

                                            transaction.commit()
                                            return Response(res, 200, { token, user })

                                        } else {

                                            transaction.rollback()` `
                                            return Response(res, 400, "Unable to initialize User Token")
                                        }
                                    })
                                } else {
                                    transaction.rollback()
                                    return Response(res, 203, "Phone|Email or Password incorrect !")
                                }
                            })
                        } else {
                            transaction.rollback()
                            return Response(res, 400, `${fillphone({ phone })} is not verified !`)
                        }
                    } else {
                        transaction.rollback()
                        console.log('====================================');
                        console.log(user);
                        console.log('====================================');
                        return Response(res, 404, `${fillphone({ phone })} is not recongnize in User's list !`)
                    }
                })
                .catch(err => {
                    return Response(res, 500, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    list: async (req, res, next) => {
        try {

            Users.belongsToMany(Roles, { through: Hasrole, attributes: ['id'] });
            Roles.belongsToMany(Users, { through: Hasrole, attributes: ['id'] });

            Provinces.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Villages.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Villages, { foreignKey: "idvillage" });


            Guichets.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Guichets, { foreignKey: "idguichet" });

            Users.findAndCountAll({
                where: {
                    status: 1
                },
                attributes: {
                    exclude: ['password', 'verificationcode', 'isvalidated', 'status']
                },
                include: [
                    {
                        model: Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: Guichets,
                        required: true,
                        attributes: ['id', 'guichet', 'adresse']
                    },
                    {
                        model: Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: Villages,
                        required: false,
                        attributes: ['id', 'territoire']
                    }
                ]
            })
                .then(({ count, rows }) => {
                    return Response(res, 200, { length: count, list: rows })
                })
                .catch(err => {
                    return Response(res, 503, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    resendcode: async (req, res, next) => {
        const { phone } = req.body;
        try {
            Users.findOne({
                where: {
                    status: 1,
                    [Op.or]: [
                        { email: phone },
                        { phone: fillphone({ phone }) }
                    ]
                }
            })
                .then(user => {
                    if (user instanceof Users) {
                        const code = randomLongNumber({ length: 6 })
                        const user_ = user.toJSON();
                        if (user_ && user_['isvalidated'] === 0) {
                            user.update({
                                verificationcode: code
                            })
                                .then(U => {
                                    Services.onSendSMS({
                                        to: fillphone({ phone }),
                                        content: `WTE-${code} \nBonjour ${capitalizeWords({ text: user && user['nom'] })} Ceci est votre code de vérification`,
                                        cb: (err, done) => { }
                                    });
                                    return Response(res, 200, `Code : ${code} was send to ${fillphone({ phone })}`)
                                })
                                .catch(err => Response(res, 400, err))
                        } else {
                            return Response(res, 400, `${fillphone({ phone })} is still verified !`)
                        }
                    } else {
                        return Response(res, 404, `${fillphone({ phone })} is not recongnize in User's list !`)
                    }
                })
                .catch(err => {
                    return Response(res, 500, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    verify: async (req, res, next) => {
        const { phone, code } = req.body;

        try {
            const transaction = await Configs.transaction();

            Users.belongsToMany(Roles, { through: Hasrole, attributes: ['id'] });
            Roles.belongsToMany(Users, { through: Hasrole, attributes: ['id'] });

            Provinces.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Villages.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Villages, { foreignKey: "idvillage" });

            Users.findOne({
                where: {
                    status: 1,
                    phone: fillphone({ phone })
                },
                attributes: {
                    exclude: ['password', 'status']
                },
                include: [
                    {
                        model: Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: Villages,
                        required: false,
                        attributes: ['id', 'territoire']
                    }
                ]
            }, { transaction })
                .then(user => {
                    if (user instanceof Users) {
                        if (parseInt(user['isvalidated']) === 0) {
                            if ((user && user['verificationcode']).toString().trim() === code.toString().trim()) {
                                Middleware.onSignin({
                                    data: {
                                        phone: user && user['phone'],
                                        uuid: user && user['uuid'],
                                        __id: user && user['id']
                                    }
                                }, (err, token) => {
                                    if (token) {

                                        user.update({
                                            isvalidated: 1
                                        })

                                        user = user.toJSON()

                                        delete user['isvalidated']
                                        delete user['verificationcode']
                                        delete user['status']

                                        transaction.commit()
                                        return Response(res, 200, { token, user })

                                    } else {

                                        transaction.rollback()
                                        return Response(res, 400, "Unable to initialize User Token")
                                    }
                                })
                            } else {
                                transaction.rollback()
                                return Response(res, 203, `${code} is not the valid code ! try a diffent code plaese !`)
                            }
                        } else {
                            transaction.rollback()
                            return Response(res, 400, `${fillphone({ phone })} is still verified !`)
                        }
                    } else {
                        transaction.rollback()
                        return Response(res, 404, `${fillphone({ phone })} is not recongnize in User's list !`)
                    }
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    update: async (req, res, next) => {
        const { id } = req.params
        const { nom, postnom, prenom, email, phone, adresse, idprovince, idterritoire, idvillage, idlabo, genre, password, avatar, idrole } = req.body;
        if (!id) return Response(res, 401, "This request must have at least uuid || id")
        try {

            Users.belongsToMany(Roles, { through: Hasrole, attributes: ['id'] });
            Roles.belongsToMany(Users, { through: Hasrole, attributes: ['id'] });

            Provinces.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Villages.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Villages, { foreignKey: "idvillage" });

            Users.findOne({
                include: [
                    {
                        model: Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: Villages,
                        required: false,
                        attributes: ['id', 'territoire']
                    }
                ],
                where: {
                    [Op.or]: [
                        { id },
                        { uuid: id }
                    ]
                }
            })
                .then(us => {
                    if (us instanceof Users) {
                        us.update({
                            nom,
                            postnom,
                            prenom,
                            email,
                            phone,
                            adresse,
                            idprovince,
                            idterritoire,
                            idvillage,
                            idlabo,
                            genre,
                            avatar
                        })
                            .then(Us => {
                                us = us.toJSON()
                                return Response(res, 200, { ...formatUserModel({ model: us }) })
                            })
                            .catch(err => {
                                console.log("Message is ==> ", err);
                                return Response(res, 503, err)
                            })
                    } else {
                        return Response(res, 404, "user not found on this server !")
                    }
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    updatepassword: async (req, res, next) => {
        const { iduser } = req.params
        const { newpassword } = req.body;
        if (!iduser) return Response(res, 401, "This request must have at least uuid || id")
        if (!newpassword) return Response(res, 401, "This request must have at least newpassword as paramter !")
        try {
            Users.belongsToMany(Roles, { through: Hasrole, attributes: ['id'] });
            Roles.belongsToMany(Users, { through: Hasrole, attributes: ['id'] });

            Provinces.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Provinces, { foreignKey: "idprovince" });

            Territoires.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Territoires, { foreignKey: "idterritoire" });

            Villages.hasOne(Users, { foreignKey: "id" });
            Users.belongsTo(Villages, { foreignKey: "idvillage" });

            const pwd = await hashPWD({ plaintext: newpassword });

            Users.findOne({
                include: [
                    {
                        model: Roles,
                        required: true,
                        attributes: ['id', 'role']
                    },
                    {
                        model: Provinces,
                        required: false,
                        attributes: ['id', 'province']
                    },
                    {
                        model: Territoires,
                        required: false,
                        attributes: ['id', 'territoire']
                    },
                    {
                        model: Villages,
                        required: false,
                        attributes: ['id', 'territoire']
                    }
                ],
                where: {
                    [Op.or]: [
                        { id: iduser },
                        { uuid: iduser }
                    ]
                }
            })
                .then(us => {
                    if (us instanceof Users) {
                        us.update({
                            password: pwd
                        })
                            .then(Us => {
                                us = us.toJSON()
                                const { phone, email, nom, postnom } = us
                                Services.onSendSMS({
                                    to: fillphone({ phone }),
                                    content: `Bonjour ${nom}, votre mot de passe vient d'etre changé en ${newpassword}`,
                                    cb: (er, dn) => { }
                                })
                                return Response(res, 200, { ...formatUserModel({ model: us }) })
                            })
                            .catch(err => {
                                return Response(res, 503, err)
                            })
                    } else {
                        return Response(res, 404, "user not found on this server !")
                    }
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    delete: async (req, res, next) => {
        const { id } = req.params;
        try {
            Users.findOne({
                where: {
                    id
                }
            })
                .then(user => {
                    if (user instanceof Users) {
                        user.destroy()
                        return Response(res, 200, "Item with id " + id + "Was succfully deleted !")
                    } else {
                        return Response(res, 404, `No user was found with id ${id}`)
                    }
                })
                .catch(err => {
                    return Response(res, 200, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    changepassword: async (req, res, next) => {
        const { newpassword, oldpassword, id, uuid } = req.body;
        const pwd = await hashPWD({ plaintext: newpassword });

        try {
            Users.findOne({
                status: 1,
                [Op.or]: [
                    { id },
                    { uuid: id }
                ]
            })
                .then(user => {
                    if (user instanceof Users) {
                        if (parseInt(user['isvalidated']) === 1) {
                            comparePWD({
                                hashedtext: user && user['password'],
                                plaintext: oldpassword
                            }, (err, verified) => {
                                if (verified) {
                                    user.update({
                                        password: pwd
                                    })
                                        .then(U => {
                                            Services.onSendSMS({
                                                to: fillphone({ phone: user && user['phone'] }),
                                                content: `Bonjour ${capitalizeWords({ text: user && user['nom'] })} votre mot de passe a été mis à jour avec succès !`,
                                                cb: (err, done) => { }
                                            });
                                        })
                                        .catch(err => {
                                            return Response(res,)
                                        })
                                } else {
                                    return Response(res, 400, "The old password is not correct !")
                                }
                            })
                        } else {
                            return Response(res, 400, `${fillphone({ phone: user && user['phone'] })} is not verified !`)
                        }
                    } else {
                        return Response(res, 404, `No user was found with id ${id}`)
                    }
                })
                .catch(err => {
                    return Response(res, 503, err)
                })
        } catch (error) {
            return Response(res, 500, error)
        }
    },

    addroletouser: async (req, res, next) => {
        const { iduser, idrole } = req.body;
        if (!iduser || !idrole) return Response(res, 401, "This request must have at least ! idrole iduser")
        try {
            Services.addRoleToUser({
                input: {
                    idrole,
                    iduser
                },
                transaction: null,
                cb: (err, done) => {
                    if (done) {
                        const { code } = done;
                        if (code === 200) {

                            // Services.onSendSMS({
                            //     to: fillphone({ phone }),
                            //     content: `Une `,
                            //     cb: (err, done) => { }
                            // });
                            // transaction.commit()
                            return Response(res, 200, "The role ")
                        } else {
                            // transaction.rollback()
                            return Response(res, 400, "Role not initialized correctly !")
                        }
                    } else {
                        // transaction.rollback()
                        return Response(res, 400, "Role not initialized correctly !")
                    }
                }
            })
        } catch (error) {
            return Response(res, 500, error)
        }
    }
}