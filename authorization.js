require('dotenv').config();
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLOUD_OAUTH_CLIENT_ID,
    process.env.GOOGLE_CLOUD_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_CLOUD_OAUTH_REDIRECT_URL
);

const KMS_SCOPES = 'https://www.googleapis.com/auth/cloudkms';

const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: KMS_SCOPES
});

// console.info(`authUrl: ${url}`);

// Get access token
// Replace with the code you've got on
const code = '4/fQHQXzqm8GHk5_0SRiTS9q3D2GJwghIQ0ckTTqOdLCBfhfQ3aXYOGu42SFG_cDN9vqqPlu25FJi11O0DRpOMx8A';
const getToken = async () => {
    const { tokens } = await oauth2Client.getToken(code);
    console.info(tokens);
};

// getToken();