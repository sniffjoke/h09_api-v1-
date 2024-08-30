import express from "express";
import {
    deleteAllDevicesController,
    deleteDeviceByIdController,
    getDevicesController
} from "../controllers/devicesController";


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
        deleteDeviceByIdController
    )

export default router
