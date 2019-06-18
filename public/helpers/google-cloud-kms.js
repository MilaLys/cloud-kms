const google = require('googleapis').google;

function KMSClient() {
    if (!(this instanceof KMSClient)) {
        return new KMSClient();
    }

    this.projectId = process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID;
    this.location = 'global';

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLOUD_OAUTH_CLIENT_ID,
        process.env.GOOGLE_CLOUD_OAUTH_CLIENT_SECRET,
        process.env.GOOGLE_CLOUD_OAUTH_REDIRECT_URL
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_CLOUD_OAUTH_REFRESH_TOKEN,
        expiry_date: process.env.GOOGLE_CLOUD_OAUTH_TOKEN_EXPIRE,
        access_token: process.env.GOOGLE_CLOUD_OAUTH_ACCESS_TOKEN,
        token_type: 'Bearer'
    });

    // Instantiates an authorized client
    this.cloudkmsClient = google.cloudkms({
        version: 'v1',
        auth: oauth2Client
    });
}

// Add the methods on the usage examples below here
module.exports = KMSClient;

KMSClient.prototype.createKeyRing = function (params) {
    const _params = {
        keyRingId: params.keyRingId,
        parent: `projects/${this.projectId}/locations/${params.location || this.location}`,
    };
    console.log(this.cloudkmsClient);
    return this.cloudkmsClient.projects.locations.keyRings.create(_params);
};

KMSClient.prototype.listKeyRing = function (params) {
    const _params = {
        parent: `projects/${this.projectId}/locations/${this.location}`,
        pageSize: params.pageSize,
        pageToken: params.pageToken,
        location: params.location,
    };

    return this.cloudkmsClient.projects.locations.keyRings
        .list(_params)
        .then(result => result.data.keyRings || [])
        .catch(error => console.log('Error happened', error));
};

KMSClient.prototype.getKeyRing = function (params) {
    const _params = {
        name: `projects/${this.projectId}/locations/${params.location || this.location}/keyRings/${params.keyRingName}`,
    };

    return this.cloudkmsClient.projects.locations.keyRings
        .get(_params)
        .then(result => result.data)
        .catch(error => console.log('Error happened', error));
};


KMSClient.prototype.createCryptoKey = function (params) {
    const _params = {
        cryptoKeyId: params.cryptoKeyId,
        parent: `projects/${this.projectId}/locations/${params.location || this.location}/keyRings/${params.keyRingName}`,
        resource: params.resource
    };

    return this.cloudkmsClient.projects.locations.keyRings.cryptoKeys.create(_params)
};

KMSClient.prototype.getCryptoKey = function (params) {
    const _params = {
        name: `projects/${this.projectId}/locations/${params.location || this.location}/keyRings/${params.keyRingName}/cryptoKeys/${params.cryptoKeyId}`,
    };

    return this.cloudkmsClient.projects.locations.keyRings.cryptoKeys.get(_params);
};

KMSClient.prototype.listCryptoKey = function (params) {
    const _params = {
        parent: `projects/${this.projectId}/locations/${params.location || this.location}/keyRings/${params.keyRingName}`,
        pageSize: params.pageSize,
        pageToken: params.pageToken,
    };

    return this.cloudkmsClient.projects.locations.keyRings.cryptoKeys.list(_params);
};

KMSClient.prototype.encrypt = function (params) {
    let name = `projects/${this.projectId}/locations/${params.location || this.location}/keyRings/${params.keyRingName}/cryptoKeys/${params.cryptoKeyId}`;

    if (params.cryptoKeyVersion) {
        name += `/cryptoKeyVersions/${params.cryptoKeyVersion}`;
    }

    const _params = {
        name,
        requestBody: params.requestBody,
    };

    return this.cloudkmsClient.projects.locations.keyRings.cryptoKeys.encrypt(_params);
};

KMSClient.prototype.decrypt = function (params) {
    let name = `projects/${this.projectId}/locations/${params.location || this.location}/keyRings/${params.keyRingName}/cryptoKeys/${params.cryptoKeyId}`;

    if (params.cryptoKeyVersion) {
        name += `/cryptoKeyVersions/${params.cryptoKeyVersion}`;
    }

    const _params = {
        name,
        requestBody: params.requestBody,
    };

    return this.cloudkmsClient.projects.locations.keyRings.cryptoKeys.decrypt(_params)
        .then(result => Buffer.from(result.data.plaintext, 'base64').toString());
};