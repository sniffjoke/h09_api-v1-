import {NextFunction, Request, Response} from 'express';
import {deviceCollection, tokenCollection} from "../db/mongo-db";
import {WithId} from "mongodb";
import {IDevice} from "../types/devices.interface";
import {tokenService} from "../services/token.service";
import {ApiError} from "../exceptions/api.error";
import {usersRepository} from "../repositories/usersRepository";


export const getDevicesController = async (req: Request<any, any, any, any>, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;
    const validateToken: any = tokenService.validateRefreshToken(token)
    if (!validateToken) {
        return next(ApiError.UnauthorizedError())
    }
    const user = await usersRepository.findUserById(validateToken._id)
    const devices = await deviceCollection.find({userId: user?._id.toString()}).toArray()
    const deviceMap = (device: WithId<IDevice>) => ({
        deviceId: device.deviceId,
        ip: device.ip,
        title: device.title,
        lastActiveDate: device.lastActiveDate,
    })
    const devicesOutput = devices.map((device) => {
        return deviceMap(device)
    })
    res.status(200).json(devicesOutput)
}

export const deleteDeviceByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.refreshToken;
        const validateToken: any = tokenService.validateRefreshToken(token)
        if (!validateToken) {
            return next(ApiError.UnauthorizedError())
        }
        const findToken = await tokenCollection.findOne({deviceId: req.params.id})
        if (!findToken) {
            return next(ApiError.UnauthorizedError())
        }
        if (validateToken._id !== findToken?.userId) {
            res.status(403).send('Сессия принадлежит другому пользователю')
            return
        }
        await deviceCollection.deleteOne({deviceId: req.params.id})
        const updateTokenInfo = await tokenCollection.updateMany({deviceId: req.params.id}, {$set: {blackList: true}})
        if (!updateTokenInfo) {
            return  next(ApiError.UnauthorizedError())
        }
        res.status(204).send('Удалено');
    } catch (e) {
        res.status(500).send(e)
    }
}

export const deleteAllDevicesExceptCurrentController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.refreshToken;
        const validateToken: any = tokenService.validateRefreshToken(token)
        if (!validateToken) {
            return next(ApiError.UnauthorizedError())
        }
        await deviceCollection.deleteMany({userId: validateToken._id, deviceId: {$ne: validateToken.deviceId}})
        // await deviceCollection.deleteMany({userId: {$ne: validateToken.userId}})
        await tokenCollection.updateMany({userId: validateToken._id, deviceId: {$ne: validateToken.deviceId}}, {$set: {blackList: true}})
        res.status(204).send('Удалено');
    } catch (e) {
        res.status(500).send(e)
    }

}
