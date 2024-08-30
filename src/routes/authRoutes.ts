import express from "express";
import {
    activateEmailUserController,
    getMeController,
    loginController, refreshTokenController,
    registerController, logoutController, resendEmailController
} from "../controllers/authController";
import {errorMiddleware} from "../middlewares/errors/errorMiddleware";
import {
    emailAuthRegisterValidator,
    loginAuthRegisterValidator,
    passwordAuthRegisterValidator
} from "../middlewares/express-validators/authValidators";
import {authMiddlewareWithBearer} from "../middlewares/auth/authMiddlewareWithBearer";
import {rateLimitMiddleware} from "../middlewares/rateLimitMiddleware";


const router = express.Router();

router.route('/login')
    .post(
        rateLimitMiddleware,
        loginController
    );



router.route('/registration')
    .post(
        loginAuthRegisterValidator,
        emailAuthRegisterValidator,
        passwordAuthRegisterValidator,
        errorMiddleware,
        registerController
    );

router.route('/registration-confirmation')
    .post(
        activateEmailUserController
    );

router.route('/registration-email-resending')
    .post(
        emailAuthRegisterValidator,
        errorMiddleware,
        resendEmailController
    );


router.route('/me')
    .get(
        authMiddlewareWithBearer,
        errorMiddleware,
        getMeController
    );

router.route('/refresh-token')
    .post(
        refreshTokenController
    )

router.route('/logout')
    .post(
        logoutController
    )

export default router
