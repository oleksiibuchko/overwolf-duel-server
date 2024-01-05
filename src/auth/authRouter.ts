import express from 'express';
import { config } from '../config';
import axios from 'axios';
import { randomUUID } from 'crypto';

const users: { [key: string]: any } = {};

const router = express.Router();

router.get('/discord/login', (req, res) => {
   const sessionId = randomUUID();
   users[sessionId] = null;
   const url = config.server.mode === 'prod' ? `https://discord.com/api/oauth2/authorize?client_id=${config.discord.clientId}&response_type=code&redirect_uri=https%3A%2F%2Foverwolf-duel-api-207077dd4a09.herokuapp.com%2Fauth%2Fdiscord%2Fcallback&scope=identify+connections&state=${sessionId}`
       : `https://discord.com/api/oauth2/authorize?client_id=${config.discord.clientId}&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fdiscord%2Fcallback&scope=identify+connections&state=${sessionId}`
    res.status(200).json({ url, sessionId });
});

// router.get('/discord/token', async( req, res ) => {
//     const code = req.query.code;
//     const params = new URLSearchParams();
//
//     params.append('client_id', config.discord.clientId);
//     params.append('client_secret', config.discord.clientSecret);
//     params.append('grant_type', 'authorization_code');
//     params.append('code', code);
//     params.append('redirect_uri', config.discord.redirectURI);
//     const headers = {
//         'Content-Type': 'application/x-www-form-urlencoded'
//     }
//
//     try {
//         const response = await axios.post('https://discord.com/api/oauth2/token', params, { headers });
//         res.status(200).json({ response });
//     } catch (error) {
//         console.log('Error', error);
//         return res.send(error);
//     }
// });

router.get('/discord/user', async( req, res ) => {
    const sessionId = req.query.sessionId;
    const user = users[sessionId];

    if (!user) {
        res.status(400).send('User not found');
        return;
    }
    const { access_token, token_type } = user;

    try {
        const response = await axios.get('https://discord.com/api/users/@me',{
            headers: {
                authorization: `${token_type} ${access_token}`
            }
        })
        return res.json({ user: response.data });

    } catch (error) {
        console.log('Error', error);
        return res.send(error);
    }
});

router.get('/discord/callback', async( req, res ) => {

    const code = req.query.code;
    const state = req.query.state;
    const params = new URLSearchParams();

    params.append('client_id', config.discord.clientId);
    params.append('client_secret', config.discord.clientSecret);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', config.discord.redirectURI);
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    try {
        const response = await axios.post('https://discord.com/api/oauth2/token', params, { headers });

        if (state) {
            users[state] = response.data;
        }

        res.send(`
            <html>
              <head>
                <title>Open Overwolf Duel App</title>
                <style>
                  body {
                    font-family: 'Arial', sans-serif;
                    text-align: center;
                    padding: 50px;
                  }
            
                  p {
                    font-size: 24px;
                    color: #7289DA;
                    font-weight: bold;
                  }
                </style>
              </head>
              <body>
                <p>Now open your Overwolf Duel app and press Continue.</p>
              </body>
            </html>
        `);
    } catch (error) {
        console.log('Error', error);
        return res.send(error);
    }

});

export { router as authRouter };
