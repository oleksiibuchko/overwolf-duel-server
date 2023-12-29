import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from './config';
import { authRouter } from './auth/authRouter';
import { fileRouter } from './file/fileRouter';

const app = express();

const corsOptions = {
  origin: config.server.mode === 'prod' ? 'https://overwolf-duel-api-207077dd4a09.herokuapp.com' : 'http://localhost:3000',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

app.use('/auth', authRouter);
app.use('/', fileRouter);

app.listen(config.server.port, () => {
  console.log(`Port is ${config.server.port}`);
});
