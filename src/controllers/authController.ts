import {NextFunction, Request, Response} from 'express';
import {userService} from "../services/user.service";
import {authService} from "../services/auth.service";
import {tokenService} from "../services/token.service";
import {IDevice} from "../types/devices.interface";
import {deviceCollection, tokenCollection} from "../db/mongo-db";
import ip from 'ip'
import {v4 as uuid} from 'uuid';
import {ApiError} from "../exceptions/api.error";
import {RTokenDB} from "../types/tokens.interface";


export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {login, email, password} = req.body
        await userService.createUser({login, email, password}, false)
        res.status(204).send('Письмо с активацией отправлено')
    } catch (e) {
        next(e)
    }
}

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const {loginOrEmail, password} = req.body;
        const user = await authService.validateUser(loginOrEmail)
        if (!user) {
            return next(ApiError.UnauthorizedError())
        }
        const myIp = ip.address()
        const userAgent = req.headers['user-agent'] as string;
        const findSession = await deviceCollection.findOne({ip: myIp, title: userAgent})
        const deviceData: IDevice = {
            deviceId: findSession ? findSession.deviceId : uuid(),
            ip: myIp,
            title: userAgent,
            lastActiveDate: new Date(Date.now()).toISOString(),
        }
        const {accessToken, refreshToken} = await authService.loginUser({loginOrEmail, password}, deviceData.deviceId)

        if (findSession) {
            await deviceCollection.updateOne(findSession, {
                $set: {
                    lastActiveDate: new Date(Date.now()).toISOString(),
                }
            })
            await tokenCollection.insertOne({
                userId: user._id.toString(),
                deviceId: findSession.deviceId,
                refreshToken,
                blackList: false,
            })
            // await tokenCollection.updateMany({refreshToken: {$ne: refreshToken}, deviceId: findSession.deviceId}, {$set: {blackList: true}})
        } else {
            const tokenData = {
                userId: user._id.toString(),
                deviceId: deviceData.deviceId,
                refreshToken,
                blackList: false
            } as RTokenDB
            await deviceCollection.insertOne(deviceData)
            await tokenCollection.insertOne(tokenData)
        }
        res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
        res.status(200).json({accessToken})
    } catch (e) {
        next(e)
    }
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await authService.getMe(tokenService.getToken(req.headers.authorization))
        res.status(200).json({
            userId: user.id,
            email: user.email,
            login: user.login,
        })
    } catch (e) {
        next(e)
    }
}

export const activateEmailUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await authService.activateEmail(req.body.code)
        res.status(204).send('Email подтвержден')
    } catch (e) {
        next(e)
    }
}

export const resendEmailController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await authService.resendEmail(req.body.email)
        res.status(204).send('Ссылка повторна отправлена')
    } catch (e) {
        next(e)
    }
}

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const {refreshToken, accessToken} = await authService.refreshToken(Object.values(req.cookies)[0])
        const {refreshToken, accessToken} = await authService.refreshToken(req.cookies.refreshToken)
        res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
        res.status(200).json({accessToken})
    } catch (e) {
        next(e)
    }
}

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await authService.logoutUser(req.cookies.refreshToken as string)
        res.clearCookie('refreshToken')
        res.status(204).send('Logout')
    } catch (e) {
        next(e)
    }
}

// const token = req.headers.cookie?.split('=')[1] as string
// const token = Object.values(req.cookies)[0]

