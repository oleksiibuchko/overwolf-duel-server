import dotenv from 'dotenv';

dotenv.config();

export const config = {
    server: {
        port: process.env.PORT || 3000
    },
    discord: {
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        redirectURI: process.env.DISCORD_REDIRECT_URI,
    },
    crypto: {
        encryptionKey: process.env.ENCRYPTION_KEY
    }
}
