import {Request, Response, NextFunction} from "express";
import {IRateLimit} from "../types/rate.interface";
import {rateLimitCollection} from "../db/mongo-db";
import {WithId} from "mongodb";
import ip from 'ip'
import {ApiError} from "../exceptions/api.error";


export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let overLimitRate: boolean
        const rateLimitData: IRateLimit = {
            URL: req.originalUrl,
            IP: ip.address(),
            date: new Date(Date.now()).toISOString()
        }
        const rateIPEnters = await rateLimitCollection.find({IP: rateLimitData.IP, URL: rateLimitData.URL}).toArray()
        try {
            overLimitRate = ((new Date(rateLimitData.date).getTime()) - (new Date(rateIPEnters[rateIPEnters.length - 5].date).getTime())) / 1000 < 10
        } catch (e) {
            overLimitRate = false
        }
        if (rateIPEnters.length > 4 && overLimitRate) {
            return next(ApiError.RateLimitError());
        }
        await rateLimitCollection.insertOne(rateLimitData as WithId<IRateLimit>)
        next()
    } catch (e) {
        return next(ApiError.RateLimitError());
    }
}
