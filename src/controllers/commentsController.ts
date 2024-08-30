import {Request, Response} from 'express';
import {ObjectId} from "mongodb";
import {commentsRepository} from "../repositories/commentsRepository";
import {commentsQueryHelper} from "../helpers/commentsHelper";
import {commentsQueryRepository} from "../queryRepositories/commentsQueryRepository";
import {tokenService} from "../services/token.service";


export const getCommentsController = async (req: Request<any, any, any, any>, res: Response) => {
    const commentsQuery = await commentsQueryHelper(req.query)
    const comments = await commentsQueryRepository.commentsSortWithQuery(commentsQuery)
    const {
        pageSize,
        pagesCount,
        totalCount,
        page,
    } = commentsQuery
    res.status(200).json({
        pageSize,
        pagesCount,
        totalCount,
        page,
        items: comments
    })
}

export const getAllCommentsByPostIdController = async (req: Request<any, any, any, any>, res: Response) => {
    const postId = req.params.id;
    const commentsQuery = await commentsQueryHelper(req.query, postId)
    const comments = await commentsQueryRepository.getAllCommentsByPostId(commentsQuery)
    const {
        pageSize,
        pagesCount,
        totalCount,
        page,
    } = commentsQuery
    res.status(200).json({
        pageSize,
        pagesCount,
        totalCount,
        page,
        items: comments
    })

}

export const getCommentByIdController = async (req: Request, res: Response) => {
    try {
        const comment = await commentsQueryRepository.commentOutput(req.params.id)
        res.status(200).json(comment)
    } catch (e) {
        res.status(500).send(e)
    }
}

export const createCommentByPostIdWithParamsController = async (req: Request, res: Response) => {
    try {
        const newCommentId = await commentsRepository.createCommentByPostIdWithParamsController(req.body.content, req.params.id, tokenService.getToken(req.headers.authorization))
        const newComment = await commentsQueryRepository.commentOutput(newCommentId.toString())
        res.status(201).json(newComment)
    } catch (e) {
        res.status(500).send(e)
    }
}

export const updateCommentController = async (req: Request, res: Response) => {
    try {
        await commentsRepository.updateCommentById(req.params.id, req.body)
        res.status(204).send('Обновлено')
    } catch (e) {
        res.status(500).send(e)
    }
}

export const deleteCommentController = async (req: Request, res: Response) => {
    try {
        await commentsRepository.deleteComment(new ObjectId(req.params.id))
        res.status(204).send('Удалено');
    } catch (e) {
        res.status(500).send(e)
    }

}

