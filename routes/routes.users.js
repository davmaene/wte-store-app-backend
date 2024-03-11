import express from 'express';
import { __controlerUsers } from '../controlers/controler.users.js';
import { onValidate, userModelOnVerification, userModelValidator, userModelOnSignin, userModelOnResendCode } from '../middleware/ware.datavalidator.js';
import { limiterResend, limiterSignin, limiterSignup, limiterVerify, rateLimiter } from '../middleware/ware.ratelimit.js';

export const __routesUsers = express.Router()

__routesUsers.post("/user/signin", onValidate(userModelOnSignin), limiterSignin, __controlerUsers.signin) //,
__routesUsers.post("/user/signup", onValidate(userModelValidator), limiterSignup, __controlerUsers.signup)
__routesUsers.post("/user/add", onValidate(userModelValidator), limiterSignup, __controlerUsers.signup)
__routesUsers.post("/user/verify", onValidate(userModelOnVerification), limiterVerify, __controlerUsers.verify)
__routesUsers.post("/user/resendcode", onValidate(userModelOnResendCode), limiterResend, __controlerUsers.resendcode)
__routesUsers.put("/user/:id", limiterSignup, __controlerUsers.update)
__routesUsers.put("/user/changepassword/:id", limiterSignup, __controlerUsers.updatepassword)
__routesUsers.delete("/user/:id", limiterSignup, __controlerUsers.delete)
__routesUsers.get("/list", __controlerUsers.list)
__routesUsers.post("/user/addrole", __controlerUsers.addroletouser)
