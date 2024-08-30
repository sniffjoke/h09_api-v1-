import {Request, Response} from 'express';
import {deviceCollection} from "../db/mongo-db";
import {ObjectId} from "mongodb";


export const getDevicesController = async (req: Request<any, any, any, any>, res: Response) => {
    console.log(req.originalUrl);
    const devices = await deviceCollection.find().toArray()
    res.status(200).json(devices)
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
