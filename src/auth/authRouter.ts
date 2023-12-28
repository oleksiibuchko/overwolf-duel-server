import express from 'express';
import { config } from '../config';
import axios from 'axios';

const router = express.Router();

router.get('/discord', async( req, res ) => {

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
    console.log(params);

    try {
        const response = await axios.post('https://discord.com/api/oauth2/token', params, { headers });
        const { access_token, token_type } = response.data;
        const userDataResponse = await axios.get('https://discord.com/api/users/@me',{
            headers: {
                authorization: `${token_type} ${access_token}`
            }
        })
        console.log('Data: ',userDataResponse.data)
        user = {
            username: userDataResponse.data.username,
            email: userDataResponse.data.email,
            avatar: `https://cdn.discordapp.com/avatars/350284820586168321/80a993756f84e94536481f3f3c1eda16.png`
        }
        return res.send(`
            <div style="margin: 300px auto;
            max-width: 400px;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: sans-serif;"
            >
                <h3>Welcome ${user.username}</h3>
                <span>Email: ${user.email}</span>
                
                <img src="${user.avatar}"/>
            </div>
        `)

    } catch (error) {
        console.log('Error', error);
        return res.send(error);
    }
});

export { router as authRouter };
