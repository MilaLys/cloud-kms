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
const code = '4/bAEhYd8ccrUWmK56JVonwXAEaMVIsx_daF38cfR2kvry84YBxKUlKS1mJQaZBK4IB7AUZPMu86IaKwPK7577yeY';
const getToken = async () => {
    const { tokens } = await oauth2Client.getToken(code);
    // console.info(tokens);
};

// getToken();