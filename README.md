### Running the application
You will need node, bower, and gulp to be installed on your machine. If you don't already, you can download and install node from <a href="https://nodejs.org/en/download/">here</a>. Run the following commands after you install node on your machine.

```
npm install bower -g
npm install gulp -g
```

cd into the repo and run the following commands.
```
npm install
bower install
```

To start the application locally, run
```
npm start
```

Your application will run on <a href="http://localhost:5000">http://localhost:5000</a>

## Pushing to the Cloud

### Create a distribution version

Before you push the application to the cloud, you will need to create a distribution version of your app. This will create an optimized build. You will need to run this command every time before you deploy to the Cloud.

```
npm run build
```

When you're ready to push your application to CloudFoundry, update the manifest.yml file. Change the name of the application to yours and uncomment and add any services you want to bind to your application. Uncomment the clientId and base64ClientCredential and enter the values from your UAA.

```
---
applications:
  - name: sentiment-analyzer-9000
    memory: 64M
    buildpack: nodejs_buildpack
    command: node server/app.js
    path: dist
#services:
env:
    node_env: cloud
    uaa_service_label : predix-uaa
    twitterKey: your-twitter-base64Credentials
    accessKeyId: your-aws-accessID
    secretAccessKey: your-aws-secret
```
Run the following command to push the app to the cloud.
```
cf push
```
