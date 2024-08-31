import {NextFunction, Request, Response} from 'express';
import {userService} from "../services/user.service";
import {authService} from "../services/auth.service";
import {tokenService} from "../services/token.service";
import {IDevice} from "../types/devices.interface";
import {deviceCollection} from "../db/mongo-db";
import ip from 'ip'


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
        const {accessToken, refreshToken} = await authService.loginUser({loginOrEmail, password})
        const deviceData: IDevice = {
            deviceId: req.headers["user-agent"] as string,
            ip: ip.address(),
            title: req.headers["user-agent"] as string,
            lastActiveDate: new Date(Date.now()).toISOString(),
        }
        await deviceCollection.insertOne(deviceData)
        // res.set('user-agent', req.ip)
        // res.cookie('refreshToken', refreshToken.split(';')[0], {httpOnly: true, secure: true})
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
        const {refreshToken, accessToken} = await authService.refreshToken(Object.values(req.cookies)[0])
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

