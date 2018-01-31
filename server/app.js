var http = require('http');
var express = require('express');
var path = require('path');
const bodyParser = require('body-parser');
var app = express();
var httpServer = http.createServer(app);
var axios = require('axios');
var AWS = require('aws-sdk');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname, process.env['base-dir'] ? process.env['base-dir'] : '../')));

// if running locally, we need to set up the proxy from local config file:
var node_env = process.env.node_env || 'development';
console.log('************ Environment: '+node_env+'******************');

if (node_env === 'development') {
  var devConfig = require('./localConfig.json')[node_env];
  var twitterKey = devConfig.twitterKey;
  var accessKeyId = devConfig.accessKeyId;
  var secretAccessKey = devConfig.secretAccessKey;
} else {
  var twitterKey = process.env.twitterKey;
  var accessKeyId = process.env.accessKeyId;
  var secretAccessKey = process.env.secretAccessKey;
}

AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region:'us-west-2'
});

var comprehend = new AWS.Comprehend({apiVersion: '2017-11-27'});
var twitter_token;

const headers = {
  Authorization: `Basic ${twitterKey}`
}

axios.post('https://api.twitter.com/oauth2/token?grant_type=client_credentials', {}, {headers})
.then(res => {
  twitter_token = res.data.access_token;
})
.catch(err => {
  console.log('Error getting Twitter Token')
});

app.post('/analyzeSentiment', function(req, res){
  var sentiment = [];
  var count = 0;
  axios.get('https://api.twitter.com/1.1/search/tweets.json?q='+req.body.query,{
    headers: {
      Authorization: `Bearer ${twitter_token}`
    }
  })
  .then(response => {
    const tweets = response.data.statuses;
    if(tweets.length === 0){
      res.status(400).send('No Tweets for found for that phrase')
    }
    else {
      var count = 0;

      var temp = new Promise((resolve, reject) => {

        tweets.forEach(tweet => {
          calculateSentiment(tweet.text, (result) => {
            if(result === 'error in detectSentiment'){
              reject('There was a problem analyzing the tweets. Try reloading the page.');
            }
            else{
              count++;
              result.tweet = tweet.text;
              sentiment.push(result)
              if(count === tweets.length){
                resolve(true);
              }
            }
          })
        })

      })
    }

    temp.then(()=>{
      res.send(sentiment)
    })
    .catch(err => {
      res.status(400).send(err)
    })
  })
  .catch(err => {
    console.log('Error getting Tweets')
    res.status(400).send('Error getting Tweets. Try reloading the page')
  })
})

calculateSentiment = (query, getSentiment) => {
  var params = {
    LanguageCode: 'en', /* required */
    Text: query /* required */
  };
  comprehend.detectSentiment(params, function(err, data) {
    if(err){
      console.log('Error in detectSentiment()')
      getSentiment('error in detectSentiment');
    }
    else{
      getSentiment(data);
    }
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	if (!res.headersSent) {
		res.status(err.status || 500);
		res.send({
			message: err.message,
			error: {}
		});
  }
});

////// error handlers //////
// catch 404 and forward to error handler
app.use(function(err, req, res, next) {
  console.error(err.stack);
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// development error handler - prints stacktrace
if (node_env === 'development') {
	app.use(function(err, req, res, next) {
		if (!res.headersSent) {
			res.status(err.status || 500);
			res.send({
				message: err.message,
				error: err
			});
		}
	});
}

httpServer.listen(process.env.VCAP_APP_PORT || 5000, function () {
	console.log ('Server started on port: ' + httpServer.address().port);
});

module.exports = app;