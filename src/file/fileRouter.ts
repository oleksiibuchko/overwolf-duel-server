import express from 'express';
import { decrypt, encrypt } from '../utils/crypto';
import * as fs from 'fs';
import path from 'path';
import { readdirSync } from "fs";

const router = express.Router();

const rootDir = './';

router.get('/', async (req: any, res: any) => {
    const sessionId = req.query.sessionId;

    if (!sessionId) {
        res.status(401).send('Invalid session Id');
        return;
    }

    const dataArray = [];
    const gamesDir = './games';
    const userFoldersPath = path.join(gamesDir, sessionId);

    try {
        // Check if the user directory exists
        if (!fs.existsSync(userFoldersPath) || !fs.statSync(userFoldersPath).isDirectory()) {
            res.status(404).send('User directory not found');
            return;
        }

        // Get user folders within the user directory
        const userFolders = readdirSync(userFoldersPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        let count = 0;

        if (!userFolders.length) {
            res.status(200).send([]);
            return;
        }

        userFolders.forEach((folder) => {
            const folderPath = path.join(userFoldersPath, folder);
            const filePath = path.join(folderPath, 'data.txt');

            fs.readFile(filePath, 'utf8', (readErr, data) => {
                if (readErr) {
                    console.error(`Error reading ${filePath}:`, readErr);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                dataArray.push({ folder, data: JSON.parse(decrypt(data)) });
                count++;

                if (count === userFolders.length) {
                    res.status(200).send(dataArray);
                }
            });
        });
    } catch (error) {
        console.error('Error retrieving user folders and data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/writeToFile', (req: any, res: any) => {
    const bodyData = req.body.data;
    const sessionId = req.body.sessionId;

    if (!sessionId || !bodyData || !bodyData.events || !bodyData.info || !bodyData.fileName) {
        res.status(500).send('Invalid data');
        return;
    }

    const encryptedData = encrypt(JSON.stringify(bodyData, null, 2));

    const gamesDir = './games';
    const sessionDir = path.join(gamesDir, sessionId);
    const fileNameDir = path.join(sessionDir, bodyData.fileName);

    // Ensure the base directory (./games) exists
    if (!fs.existsSync(gamesDir)) {
        fs.mkdirSync(gamesDir);
    }

    // Create the session directory
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir);
    }

    // Create the file name directory
    if (!fs.existsSync(fileNameDir)) {
        fs.mkdirSync(fileNameDir);
    }

    // Write data to file
    fs.writeFile(path.join(fileNameDir, 'data.txt'), encryptedData, (err) => {
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
