import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default function handleErrors(): ErrorRequestHandler {
  return function handleErrorsMiddleware(
    error: Error & { status?: number },
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { message, status } = error;

    res.status(status ?? 500).json({
      error:
        message ||
        `Internal Server Error: ${error.stack ?? 'No stack provided'}`,
    });
  };
}

export class HttpException extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
