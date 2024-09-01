

export class ApiError extends Error {
        status;
        field;

    constructor(status: number, message: string, field: string) {
        super(message);
        this.status = status;
        this.field = field
    }

    static UnauthorizedError() {
        return new ApiError(401, 'Пользователь не авторизован', 'login')
    }

    static BadRequest(message: string, field: string) {
        return new ApiError(400, message, field);
    }

    static AnyUnauthorizedError(message: string) {
        return new ApiError(401, message, 'Some field')
    }

    static RateLimitError() {
        return new ApiError(429, 'Слишком частая попытка входа', 'Any field')
    }

}
