import {NextFunction, Request, Response} from "express";
import {ApiError} from "../../exceptions/api.error";
import {tokenService} from "../../services/token.service";
import {tokensRepository} from "../../repositories/tokensRepository";

export const authMiddlewareWithCookie = async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization as string
    if (!token) {
        return next(ApiError.UnauthorizedError())
    }

    try {
        const tokenValidate: any = tokenService.validateRefreshToken(token)
        if (!tokenValidate) {
            return next(ApiError.UnauthorizedError())
        }
        const isTokenExists = await tokensRepository.findTokenByRefreshToken(token)
        if (!isTokenExists || isTokenExists.blackList) {
            return next(ApiError.UnauthorizedError())
        }
        next()
    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}
