// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({

  // Enable email verification
 verifyUserEmails: process.env.VERIFY_EMAIL || false,

 // if `verifyUserEmails` is `true` and
 //     if `emailVerifyTokenValidityDuration` is `undefined` then
 //        email verify token never expires
 //     else
 //        email verify token expires after `emailVerifyTokenValidityDuration`
 //
 // `emailVerifyTokenValidityDuration` defaults to `undefined`
 //
 // email verify token below expires in 2 hours (= 2 * 60 * 60 == 7200 seconds)
 emailVerifyTokenValidityDuration: 5 * 60 * 60, // in seconds (2 hours = 7200 seconds)

 // set preventLoginWithUnverifiedEmail to false to allow user to login without verifying their email
 // set preventLoginWithUnverifiedEmail to true to prevent user from login if their email is not verified
 preventLoginWithUnverifiedEmail: false, // defaults to false

  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'https://lexgo.herokuapp.com/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  appName:process.env.APP_NAME || "Lexgo",
  publicServerURL:process.env.SERVER_URL || 'https://lexgo.herokuapp.com/parse',

  push: {
      android: {
        senderId: process.env.SENDER_ID || '',
        apiKey: process.env.GCM_API_KEY || ''
      }
    },

  //Email
  emailAdapter: {
    module: 'parse-server-simple-mailgun-adapter',
    options: {
      // The address that your emails come from in the reset
      fromAddress: process.env.FROM_EMAIL || 'parse@example.com',
      // Your domain from mailgun.com
      domain: process.env.EMAIL_DOMAIN || 'example.com',
      // Your API key from mailgun.com
      apiKey: process.env.MAIL_GUN_KEY || 'key-mykey',
    }
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('Make sure to star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
