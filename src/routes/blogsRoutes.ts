import express from "express";
import {
    createBlogController, deleteBlogController, getBlogByIdController,
    getBlogsController, updateBlogController

} from "../controllers/blogsController";
import {
    descriptionBlogValidator,
    idBlogValidator,
    nameBlogValidator,
    websiteUrlValidator
} from "../middlewares/express-validators/blogsValidators";
import {errorMiddleware} from "../middlewares/errors/errorMiddleware";
import {getAllPostsByBlogId, createPostByBlogIdWithParams} from "../controllers/postsController";
import {
    contentPostValidator,
    shortDescriptionPostValidator,
    titlePostValidator
} from "../middlewares/express-validators/postsValidators";
import {authMiddlewareWithBasic} from "../middlewares/auth/authMiddlewareWithBasic";


const router = express.Router();

router.route('/')
    .get(getBlogsController)
    .post(
        authMiddlewareWithBasic,
        nameBlogValidator,
        descriptionBlogValidator,
        websiteUrlValidator,
        errorMiddleware,
        createBlogController
    );
router.route('/:id')
    .put(
        authMiddlewareWithBasic,
        idBlogValidator,
        nameBlogValidator,
        websiteUrlValidator,
        descriptionBlogValidator,
        errorMiddleware,
        updateBlogController
    )
    .delete(
        authMiddlewareWithBasic,
        idBlogValidator,
        errorMiddleware,
        deleteBlogController
    )
    .get(
        idBlogValidator,
        errorMiddleware,
        getBlogByIdController
    );

router.route('/:id/posts')
    .get(
        idBlogValidator,
        errorMiddleware,
        getAllPostsByBlogId
    )
    .post(
        authMiddlewareWithBasic,
        idBlogValidator,
        contentPostValidator,
        shortDescriptionPostValidator,
        titlePostValidator,
        errorMiddleware,
        createPostByBlogIdWithParams
    )


export default router
