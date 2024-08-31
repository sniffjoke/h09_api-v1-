import {Request, Response, NextFunction} from "express";
import {IRateLimit} from "../types/rate.interface";
import {rateLimitCollection} from "../db/mongo-db";
import {WithId} from "mongodb";
import ip from 'ip'
import {ApiError} from "../exceptions/api.error";


export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let tryingCount: boolean
        const rateLimitData: IRateLimit = {
            URL: req.baseUrl,
            IP: ip.address(),
            date: new Date(Date.now()).toISOString()
        }
        const rateIPEnters = await rateLimitCollection.find({IP: rateLimitData.IP}).toArray()
        try {
            tryingCount = ((new Date(rateLimitData.date).getTime()) - (new Date(rateIPEnters[rateIPEnters.length - 1].date).getTime())) / 1000 < 10
        } catch (e) {
            tryingCount = false
        }
        if (rateIPEnters.length > 4 && tryingCount) {
            return next(ApiError.RateLimitError());
        }
        await rateLimitCollection.insertOne(rateLimitData as WithId<IRateLimit>)
        next()
    } catch (e) {
        return next(ApiError.RateLimitError());
    }
}
