import {Request, Response} from 'express';
import {deviceCollection} from "../db/mongo-db";
import {ObjectId} from "mongodb";
import {IDevice} from "../types/devices.interface";


export const getDevicesController = async (req: Request<any, any, any, any>, res: Response) => {
    console.log(req.originalUrl);
    const devices = await deviceCollection.find().toArray()
    res.status(200).json(devices)
}

export const createDeviceController = async (req: Request<any, any, any, any>, res: Response) => {
    const deviceData: IDevice = {
        deviceId: '123jkfds3i24dfjs',
        ip: req.ip as string,
        title: req.headers["user-agent"] as string,
        lastActiveDate: new Date(Date.now()).toISOString(),
    }
    const device = await deviceCollection.insertOne(deviceData)
    res.status(201).json(device)
}

export const deleteDeviceByIdController = async (req: Request, res: Response) => {
    try {
        await deviceCollection.deleteOne({_id: new ObjectId(req.params.id)})
        res.status(204).send('Удалено');
    } catch (e) {
        res.status(500).send(e)
    }
}

export const deleteAllDevicesController = async (req: Request, res: Response) => {
    try {
        await deviceCollection.deleteMany()
        res.status(204).send('Удалено');
    } catch (e) {
        res.status(500).send(e)
    }

}
