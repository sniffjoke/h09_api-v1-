import express from "express";
import {
    deleteAllDevicesController,
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
        deleteAllDevicesController
    )

router.route('/:id')
    .delete(
        idDeviceValidator,
        errorMiddleware,
        deleteDeviceByIdController
    )

export default router
