import express from "express";
import {
    deleteAllDevicesExceptCurrentController,
    deleteDeviceByIdController,
    getDevicesController
} from "../controllers/devicesController";
import {idDeviceValidator} from "../middlewares/express-validators/devicesValidators";
import {errorMiddleware} from "../middlewares/errors/errorMiddleware";


const router = express.Router();

router.route('/')
    .get(
        getDevicesController
    )
    .delete(
        deleteAllDevicesExceptCurrentController
    )

router.route('/:id')
    .delete(
        idDeviceValidator,
        errorMiddleware,
        deleteDeviceByIdController
    )

export default router
