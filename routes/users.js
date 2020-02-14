"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Tools_1 = require("../Tools");
const Response_1 = require("../dataModels/Response");
const Services_1 = require("../Services");
let router = require('express').Router();
/* GET users listing. */
//login without session token
router.post('/authenticate', async function (req, res) {
    //console.log("inauth");
    let username = req.body['username'];
    let password = req.body['password'];
    console.log(req.body);
    if (Tools_1.isVoid(username)) {
        res.json(Response_1.JsonResponse(false, 'invalid username'));
        return;
    }
    if (Tools_1.isVoid(password)) {
        res.json(Response_1.JsonResponse(false, 'invalid password'));
        return;
    }
    if (await Services_1.LoginService.VerifyUser(username, password)) {
        let user = await Services_1.UserService.GetByUsername(username);
        let sess = await Services_1.SessionService.CreateSession(user);
        res.cookie('session', sess.key, {
            expires: sess.expiry,
            path: '/',
            sameSite: "strict"
        });
        res.json(Response_1.JsonResponse(true, 'Success', {
            sessionKey: sess.key,
            expiry: sess.expiry,
            userCreditCurrency: user.creditCurrency,
            userCredit: user.credit,
            ownedShares: user.ownedShares
        }));
        return true;
    }
    res.json(Response_1.JsonResponse(false, 'Incorrect username or password'));
});
router.get('/logout', async function (req, res) {
    let sessionkey = req.body['sessionKey'];
    await Services_1.SessionService.InvalidateSession(sessionkey);
    res.json(Response_1.JsonResponse(true));
});
module.exports = router;
//# sourceMappingURL=users.js.map