import express from "express";
import {
    createUserController,
    deleteUserByIdController,
    getUsersController
} from "../controllers/usersController";
import {idUserValidator} from "../middlewares/express-validators/authValidators";
import {errorMiddleware} from "../middlewares/errors/errorMiddleware";
import {authMiddlewareWithBasic} from "../middlewares/auth/authMiddlewareWithBasic";
import {emailUserValidator, loginUserValidator, passwordUserValidator} from "../middlewares/express-validators/usersValidators";


const router = express.Router();

router.route('/')
    .get(getUsersController)
    .post(
        authMiddlewareWithBasic,
        loginUserValidator,
        emailUserValidator,
        passwordUserValidator,
        errorMiddleware,
        createUserController
    );
router.route('/:id')
    .delete(
        authMiddlewareWithBasic,
        idUserValidator,
        errorMiddleware,
        deleteUserByIdController
    )

export default router
