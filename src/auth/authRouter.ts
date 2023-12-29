import express from 'express';
import { config } from '../config';
import axios from 'axios';

const router = express.Router();

router.get('/discord/login', (req, res) => {
   const url = config.server.mode === 'prod' ? 'https://discord.com/api/oauth2/authorize?client_id=1189626660190949467&response_type=code&redirect_uri=https%3A%2F%2Foverwolf-duel-api-207077dd4a09.herokuapp.com%2Fauth%2Fdiscord%2Fcallback&scope=identify'
       : 'https://discord.com/api/oauth2/authorize?client_id=1189626660190949467&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fdiscord%2Fcallback&scope=identify'
    res.status(200).json({ url });
});

router.get('/discord/token', async( req, res ) => {
    const code = req.query.code;
    const params = new URLSearchParams();

    let user;
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
        res.status(200).json({ response });
    } catch (error) {
        console.log('Error', error);
        return res.send(error);
    }
});

router.post('/discord/user', async( req, res ) => {

    const { access_token, token_type } = req.body.data;

    try {
        const user = await axios.get('https://discord.com/api/users/@me',{
            headers: {
                authorization: `${token_type} ${access_token}`
            }
        })
        return res.json({ user });

    } catch (error) {
        console.log('Error', error);
        return res.send(error);
    }
});

router.post('/discord/callback', async( req, res ) => {
    res.status(200).send();
});

export { router as authRouter };
