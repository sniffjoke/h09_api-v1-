import {param} from "express-validator";
import {deviceCollection} from "../../db/mongo-db";

export const idDeviceValidator = param('id')
    .custom(async id => {
        const device: any = await deviceCollection.findOne({deviceId: id})
        if (!device) {
            throw new Error('Not found')
        } else {
            return !!device
        }
    }).withMessage('Пользователь с заданным id не найден!')
