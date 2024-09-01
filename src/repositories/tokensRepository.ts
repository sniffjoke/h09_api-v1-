import {tokenCollection} from "../db/mongo-db";
import {ObjectId, WithId} from "mongodb";
import {RTokenDB} from "../types/tokens.interface";


export const tokensRepository = {

    async findTokenByRefreshToken(token: string) {
        return await tokenCollection.findOne({refreshToken: token})
    },

    async updateTokenForActivate(refreshToken: string) {
        const updatedToken = await tokenCollection.updateMany({refreshToken}, {$set: {blackList: true}})
        return updatedToken
    },

    async createToken(tokenData: RTokenDB): Promise<ObjectId> {
        const token = {
            userId: tokenData.userId,
            deviceId: tokenData.deviceId,
            refreshToken: tokenData.refreshToken,
            blackList: false
    } as WithId<RTokenDB>;
    const  newToken = await tokenCollection.insertOne(token as WithId<RTokenDB>)
    return newToken.insertedId
},
}
