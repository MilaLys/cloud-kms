var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// const envkey = require('envkey');
// const envkeyLoader = require('envkey/loader');
//
// envkeyLoader.fetch({
//   dotEnvFile: ".development.env",
//   permitted: ["KEY_1"]
// }, function(err, res){
//   console.log('Config loaded', res.KEY_1)
// });

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
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
  scope: KMS_SCOPES,
});

console.info(`authUrl: ${url}`);