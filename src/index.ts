import express from 'express';
import * as fs from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';
import { encrypt } from './crypto';
import { config } from './config';

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.post('/writeToFile', (req: any, res: any) => {
  const bodyData = req.body.data;
  if (!bodyData || !bodyData.events || !bodyData.info || !bodyData.fileName) {
    res.status(500).send('Invalid data');
    return;
  }

  const encryptedData = encrypt(JSON.stringify(bodyData, null, 2));

  const dir = `./${bodyData.fileName}`;

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  fs.writeFile(`${dir}/data.txt`, encryptedData, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error writing to file');
    } else {
      console.log('Data written to file successfully');
      res.status(200).send();
    }
  });
});

app.listen(config.server.port, () => {
  console.log(`Port is ${config.server.port}`);
});
