import {NextFunction, Request, Response} from 'express';
import {deviceCollection, tokenCollection} from "../db/mongo-db";
import {WithId} from "mongodb";
import {IDevice} from "../types/devices.interface";
import {tokenService} from "../services/token.service";
import {ApiError} from "../exceptions/api.error";
import {v4 as uuid} from 'uuid';
import {tokensRepository} from "../repositories/tokensRepository";


export const getDevicesController = async (req: Request<any, any, any, any>, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;
    const validateToken = tokenService.validateRefreshToken(token)
    if (!validateToken) {
        return next(ApiError.UnauthorizedError())
    }
    const devices = await deviceCollection.find().toArray()
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

export const createDeviceController = async (req: Request<any, any, any, any>, res: Response) => {
    const deviceData: IDevice = {
        ip: req.ip as string,
        deviceId: uuid(),
        title: req.headers["user-agent"] as string,
        lastActiveDate: new Date(Date.now()).toISOString(),
    }
    const device = await deviceCollection.insertOne(deviceData)
    res.status(201).json(device)
}

export const deleteDeviceByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.refreshToken;
        const validateToken: any = tokenService.validateRefreshToken(token)
        if (!validateToken) {
            return next(ApiError.UnauthorizedError())
        }
        const removedToken = await tokenCollection.findOne({deviceId: req.params.id})
        if (validateToken._id !== removedToken?.userId) {
            res.status(403).send('Сессия принадлежит другому пользователю')
            return
        }
        await deviceCollection.deleteOne({deviceId: req.params.id})
        const updateTokenInfo = await tokensRepository.updateTokenForActivate(token)
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
        await deviceCollection.deleteMany({deviceId: {$ne: validateToken.deviceId}})
        await tokenCollection.updateMany({refreshToken: token, deviceId: {$ne: validateToken.deviceId}}, {$set: {blackList: true}})
        res.status(204).send('Удалено');
    } catch (e) {
        res.status(500).send(e)
    }

}
