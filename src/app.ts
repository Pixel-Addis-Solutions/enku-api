import express, { Application, Request, Response, NextFunction } from "express";
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import logger from "./util/logger";
import { ResUtil } from "./helper/response.helper";
import routes from "./routes/index";
import * as Sentry from '@sentry/node';
import cors from 'cors';
require('dotenv').config();
// Sentry.init({ dsn: "your-dsn-here" });

const app: Application = express();
app.use(cors())
app.use(express.json());

// app.use(Sentry.Handlers.requestHandler());

app.use("/", routes);

// app.use(Sentry.Handlers.errorHandler());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`);
  ResUtil.internalError({ res, message: "Internal Server Error", data: err });
});

AppDataSource.initialize()
  .then(() => {
    app.listen(5000, () => {
      console.log('Server is running on port 5000');

    });
  }) 
  .catch((error) => console.log('Error: ', error));
export default app;
