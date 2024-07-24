import Sentry  from '@sentry/node';
import { Response } from "express";

type Params = {
  res: Response;
  message: string;
  data?: any;
  meta?: any;
};

const sendResponse = (
  res: Response,
  status: number,
  message: string,
  data?: any,
  meta?: any
) => {
  // try {
    
  // } catch (error) {
    
  // }
  return res.status(status).json({
    status: status === 200 ? true : false,
    message,
    data: data,
    meta
  });
};

export const ResUtil = {
  success: ({ res, message='Success', data,meta={} }: Params) => {
    sendResponse(res, 200, message, data,meta);
  },
  created: ({ res, message, data }: Params) => {
    sendResponse(res, 201, message, data);
  },
  accepted: ({ res, message, data }: Params) => {
    sendResponse(res, 202, message, data);
  },
  noContent: ({ res, message }: Params) => {
    res.status(204).send({
      message,
    });
  },
  badRequest: ({ res, message, data }: Params) => {
    if (data?.code === 'ER_DUP_ENTRY') {
      // Duplicate entry error
      message = "Duplicate entry error: The entry already exists.";
      data = {};
    }else if (data?.code === 'ER_ROW_IS_REFERENCED_2') {
      // Foreign key violation
      message = "Reference error: This record is being referenced by another entity and cannot be deleted.";

    }
    sendResponse(res, 400, message, data);
  },
  unAuthorized: ({ res, message, data }: Params) => {
    sendResponse(res, 403, message, data);
  },
  unAuthenticated: ({ res, message, data }: Params) => {
    sendResponse(res, 401, message, data);
  },
  unVerified: ({ res, message, data }: Params) => {
    sendResponse(res, 406, message, data);
  },
  notFound: ({ res, message, data }: Params) => {
    sendResponse(res, 404, message, data);
  },
  unprocessable: ({ res, message, data }: Params) => {
    sendResponse(res, 422, message, data);
  },
  internalError: ({ res, message, data }: Params) => {
    if(data?.sqlMessage){
      message =data?.sqlMessage;
      // data = {}///
    }
    Sentry?.captureException(data);
    sendResponse(res, 500, message, data);
  },
};
