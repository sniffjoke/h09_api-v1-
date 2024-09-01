import {
    blogCollection,
    commentCollection,
    deviceCollection,
    postCollection,
    tokenCollection,
    userCollection
} from "../db/mongo-db";


export const testingRepository = {
    async deleteAll() {
        const blogs = await blogCollection.deleteMany()
        const posts = await postCollection.deleteMany()
        const users = await userCollection.deleteMany()
        const comments = await commentCollection.deleteMany()
        const tokens = await tokenCollection.deleteMany()
        const devices = await deviceCollection.deleteMany()
        // const rates = await rateLimitCollection.deleteMany()
        return {
            blogs,
            posts,
            users,
            comments,
            tokens,
            devices,
            // rates
        }
    },
}
