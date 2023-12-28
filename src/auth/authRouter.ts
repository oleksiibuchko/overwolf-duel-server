import express from 'express';
import { config } from '../config';
import axios from 'axios';

const router = express.Router();

router.get('/discord/login', (req, res) => {
   const url = process.env.PORT ? 'https://discord.com/api/oauth2/authorize?client_id=1189626660190949467&response_type=code&redirect_uri=https%3A%2F%2Foverwolf-duel-api-207077dd4a09.herokuapp.com%2Fauth%2Fdiscord%2Fcallback&scope=identify'
       : 'https://discord.com/api/oauth2/authorize?client_id=1189626660190949467&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fdiscord%2Fcallback&scope=identify'
    res.status(200).json({ url });
});

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
        console.log(response);
        const { access_token, token_type } = response.data;
        const userDataResponse = await axios.get('https://discord.com/api/users/@me',{
            headers: {
                authorization: `${token_type} ${access_token}`
            }
        })
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
