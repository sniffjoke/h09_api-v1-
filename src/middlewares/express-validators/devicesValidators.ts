import {param} from "express-validator";
import {ObjectId} from "mongodb";
import {deviceCollection} from "../../db/mongo-db";

export const idDeviceValidator = param('id')
    .custom(async id => {
        const user: any = await deviceCollection.findOne({_id: new ObjectId(id)})
        if (!user) {
            throw new Error('Not found')
        } else {
            return !!user
        }
    }).withMessage('Пользователь с заданным id не найден!')
