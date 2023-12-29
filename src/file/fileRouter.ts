import express from 'express';
import { decrypt, encrypt } from '../utils/crypto';
import * as fs from 'fs';
import path from 'path';
import { readdirSync } from "fs";

const router = express.Router();

const directiveExceptions = [".heroku", ".npm", ".profile.d", "dist", "node_modules", "src", ".git", ".idea"];
const rootDir = './';

router.get('/', async (req: any, res: any) => {
    const dataArray = [];

    const dirs = readdirSync('./', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(dirName => !directiveExceptions.includes(dirName));
    const filteredDirs = dirs.filter(dirName => !directiveExceptions.includes(dirName));

    let count = 0;

    if (!filteredDirs.length) {
        res.status(200).send([]);
    }

    filteredDirs.forEach((folder) => {
        const folderPath = path.join(rootDir, folder);

        fs.stat(folderPath, (statErr, stats) => {
            if (statErr) {
                console.error('Error reading file stats:', statErr);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (stats.isDirectory()) {
                const filePath = path.join(folderPath, 'data.txt');

                fs.readFile(filePath, 'utf8', (readErr, data) => {
                    if (readErr) {
                        console.error(`Error reading ${filePath}:`, readErr);
                        res.status(500).send('Internal Server Error');
                        return;
                    }

                    dataArray.push({ folder, data: JSON.parse(decrypt(data)) });
                    count++;

                    if (count === filteredDirs.length) {
                        res.status(200).send(dataArray);
                    }
                });
            }
        });
    });
});

router.post('/writeToFile', (req: any, res: any) => {
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


export { router as fileRouter };
