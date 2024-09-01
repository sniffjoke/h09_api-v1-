import {ApiError} from "../exceptions/api.error";
import {usersRepository} from "../repositories/usersRepository";
import {authRepository} from "../repositories/authRepository";
import {LoginUserDto} from "../dtos/login.dto";
import {tokenService} from "./token.service";
import {tokensRepository} from "../repositories/tokensRepository";
import {RTokenDB} from "../types/tokens.interface";
import {usersQueryRepository} from "../queryRepositories/usersQueryRepository";
import {v4 as uuid} from "uuid";
import mailService from "./mail.service";
import {userService} from "./user.service";
import {cryptoService} from "./crypto.service";
import {deviceCollection, tokenCollection} from "../db/mongo-db";


export const authService = {

    async loginUser(userData: LoginUserDto, deviceId: string) {
        const user = await this.validateUser(userData.loginOrEmail)
        if (!user) {
            throw ApiError.UnauthorizedError()
        }
        const isPasswordCorrect = await cryptoService.comparePassword(userData.password, user.password)
        if (!isPasswordCorrect) {
            throw ApiError.UnauthorizedError()
        }
        const {accessToken, refreshToken} = tokenService.createTokens(user._id.toString(), deviceId)
        const tokenData = {
            userId: user._id.toString(),
            deviceId,
            refreshToken,
            blackList: false
        } as RTokenDB
        const findedToken = await tokenCollection.findOne({userId: user._id.toString()})
        console.log(findedToken)
        if (findedToken && !findedToken.blackList) {
            await tokenCollection.updateOne(findedToken, {$set: {refreshToken}})
        } else {
            await tokensRepository.createToken(tokenData)
        }
        // await tokenCollection.updateMany({deviceId: {$ne: tokenData.deviceId}}, {$set: {blackList: true}})
        return {
            accessToken,
            refreshToken
        }
    },

    async refreshToken(token: string) {
        const tokenValidate: any = tokenService.validateRefreshToken(token)
        if (!tokenValidate) {
            throw ApiError.UnauthorizedError()
        }
        const isTokenExists = await tokensRepository.findTokenByRefreshToken(token)
        if (!isTokenExists || isTokenExists.blackList) {
            throw ApiError.UnauthorizedError()
        }
        const updateTokenInfo = await tokensRepository.updateTokenForActivate(token)
        if (!updateTokenInfo) {
            throw ApiError.UnauthorizedError()
        }
        const {refreshToken, accessToken} = tokenService.createTokens(isTokenExists.userId, tokenValidate.deviceId)
        const tokenData = {
            userId: isTokenExists.userId,
            deviceId: tokenValidate.deviceId,
            refreshToken,
            blackList: false
        } as RTokenDB
        const addTokenToDb = await tokensRepository.createToken(tokenData)
        if (!addTokenToDb) {
            throw ApiError.UnauthorizedError()
        }
        return {
            refreshToken,
            accessToken
        }

    },

    async getMe(token: string) {
        const tokenData: any = tokenService.decodeToken(token)
        const user = await usersQueryRepository.userOutput(tokenData._id)
        if (!user) {
            throw ApiError.UnauthorizedError()
        }
        return user
    },

    async logoutUser(token: string) {
        const tokenVerified: any = tokenService.validateRefreshToken(token)
        if (!tokenVerified) {
            throw ApiError.UnauthorizedError()
        }
        const tokenFromDb = await tokensRepository.findTokenByRefreshToken(token)
        if (!tokenFromDb || tokenFromDb.blackList) {
            throw ApiError.UnauthorizedError()
        }
        const updatedToken = await tokensRepository.updateTokenForActivate(tokenFromDb.refreshToken)
        if (!updatedToken) {
            throw ApiError.UnauthorizedError()
        }
        const updateDevices = await deviceCollection.deleteOne({deviceId: tokenVerified.deviceId})
        if (!updateDevices) {
            throw ApiError.UnauthorizedError()
        }
        return updatedToken
    },

    async activateEmail(confirmationCode: string) {
        const isActivateEmail = await authRepository.checkActivateEmailByCode(confirmationCode)
        if (!isActivateEmail) {
            throw ApiError.BadRequest('Юзер уже активирован', 'code')
        }
        const updateEmailStatus = await authRepository.toActivateEmail(confirmationCode)
        if (!updateEmailStatus) {
            throw ApiError.BadRequest('Юзер не найден', 'code')
        }
        return updateEmailStatus
    },

    async resendEmail(email: string) {
        await this.isActivateEmailByStatus(email)
        const activationLink = uuid()
        const emailConfirmation = userService.createEmailConfirmationInfo(false, activationLink)
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/auth/registration-confirmation/?code=${activationLink}`)
        const updateUserInfo = await authRepository.updateUserWithResendActivateEmail(email, emailConfirmation)
        if (!updateUserInfo) {
            throw ApiError.UnauthorizedError()
        }
        return updateUserInfo
    },

    async validateUser(userLoginOrEmail: string) {
        let user
        if (!/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(userLoginOrEmail)) {
            user = await usersRepository.getUserByLogin(userLoginOrEmail)
        } else {
            user = await usersRepository.getUserByEmail(userLoginOrEmail)
        }
        if (!user) {
            // throw ApiError.BadRequest('Пользователь не найден', 'loginOrEmail')
            throw ApiError.UnauthorizedError()
        }
        return user
    },

    async isActivateEmailByStatus(email: string) {
        const isActivateEmail = await usersRepository.getUserByEmail(email)
        if (!isActivateEmail) {
            throw ApiError.BadRequest('Юзер не найден', 'email')
        }
        if (isActivateEmail.emailConfirmation.isConfirmed) {
            throw ApiError.BadRequest('Юзер уже активирован', 'email')
        }
        return isActivateEmail
    }

}
