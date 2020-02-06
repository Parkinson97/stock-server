import {isVoid, randomString} from "../Tools";
import {JsonResponse, Response} from "../dataModels/Response";
import {LoginService, SessionService, UserService} from "../Services";
import {Session} from "../entity/session";

let router = require('express').Router();

/* GET users listing. */

//login without session token
router.get('/authenticate', async function(req, res) {
    let username = req.body['username'];
    let password = req.body['password'];
    if(isVoid(username)){
        res.json(JsonResponse(false, 'invalid username' ))
        return;
    }
    if(isVoid(password)){
        res.json(JsonResponse(false, 'invalid password' ))
        return;
    }

    if(await LoginService.VerifyUser(username, password)){
        let user = await UserService.GetByUsername(username);
        let sess = await SessionService.CreateSession(user);

        res.cookie('session', sess.key, {
            expires: sess.expiry,
            path: '/',
            sameSite: "strict"
        });
        res.json(JsonResponse(true, 'Success', {
            sessionKey: sess.key,
            expiry: sess.expiry
        }));
        return true;
    }
    res.json(JsonResponse(false, 'Incorrect username or password'));

});

router.get('/logout', async function(req, res) {
    let sessionkey = req.body['sessionKey'];
    await SessionService.InvalidateSession(sessionkey);
    res.json(JsonResponse(true));
});


module.exports = router;
