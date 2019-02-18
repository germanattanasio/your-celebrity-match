<h1 align="center" style="border-bottom: none;">🚀 Your Celebrity Match</h1>
<h3 align="center">Find celebrities who personality is similar to yours.
</h3>
<p align="center">
  <a href="http://travis-ci.org/watson-developer-cloud/personality-insights-nodejs">
    <img alt="Travis" src="https://travis-ci.org/watson-developer-cloud/personality-insights-nodejs.svg?branch=master">
  </a>
  <a href="#badge">
    <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
  </a>
</p>
</p>
The application uses IBM Watson [Personality Insights][pi_docs] and Twitter to find the celebrities that are similar to your personality. Twitter is being use to get the tweets for a given handler, the text from those tweets is send to Personality Insights, who analyze the text and reply with a personality profile. That profile is compared to celebrity profiles to find the most similar.

Live demo: http://your-celebrity-match.ng.bluemix.net/

# API Reference:

[![Greenkeeper badge](https://badges.greenkeeper.io/watson-developer-cloud/your-celebrity-match.svg)](https://greenkeeper.io/)

The application uses [The Personality Insights API](https://www.ibm.com/watson/developercloud/personality-insights/api/v2/)

# How it works

 1. You input your Twitter handle.
 1. Calls the Twitter API to get the latest 2300 tweets from your public feed.
 1. Calls the Personality Insights API to analyze the language in your tweets and apply it to a spectrum of characteristics.
 1. Compares your Personality Insights profile to 232 celebrity profiles analyzed with the service.
 1. Sorts your matches and shows you the highest and lowest. These are calculated by the euclidean distance between the two.

## Prerequisites

1. Sign up for an [IBM Cloud account](https://console.bluemix.net/registration/).
1. Download the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview).
1. Create an instance of the Language Translator service and get your credentials:
    - Go to the [Personality Insights](https://console.bluemix.net/catalog/services/personality-insights) page in the IBM Cloud Catalog.
    - Log in to your IBM Cloud account.
    - Click **Create**.
    - Click **Show** to view the service credentials.
    - Copy the `apikey` value, or copy the `username` and `password` values if your service instance doesn't provide an `apikey`.
    - Copy the `url` value.


## Getting Started

This instructions will help you install the celebrities app in your local environment.

1. Clone the repository with:
    ```sh
    $ git clone git@github.com:watson-developer-cloud/your-celebrity-match.git
    ```
1. Install [node][node]
1. Install [mongodb][mongodb]
1. Install the npm modules:
    ```sh
    $ npm install
    ```
    **Note:** Make sure you are in the project directory, the `package.json` file should be visible.
1. Start mongodb
    ```sh
    $ mongod
    ```
    (Run this in a separate terminal window)
1. You need some credentials to use Twitter API, Personality Insights and MongoDB:
  - Get credentials to use Personality Insights.
  - Create a **FREE** Mongodb database using [MongoLab](https://mlab.com/).  
  - Create a Twitter app and get the API credentials [here][twitter_app].
1. Update the Twitter, MongoDB and Personality Insights credentials in `config/config.js`

    ```js
    mongodb: process.env.MONGODB || 'mongodb://localhost/celebs',

    {
      personality_insights: {
        version: '2017-10-13',
        url:      '<url>',
        iam_apikey: '<username>'s
      },

      twitter: [{
        consumer_key:       '<consumer_key>',
        consumer_secret:    '<consumer_secret>',
        access_token_key:   '<access_token_key>',
        access_token_secret:'<access_token_secret>'
      }]
    }
    ```

1. Start the app

    ```sh
    $ npm start
    ```

1. Update the database with the celebrities by making a **POST** request to:
    `http://localhost:3000/celebrities/syncdb`

    The celebrities are not added by default. Hence the above step is recommended. Refer #Celebrities section below for more information.
    When running in bluemix make sure the environment variable `DEMO` is set to `0`.
1. You can add additional celebrities to the database as long as they are verified, have at least 10,000 followers, and have over 1,000 tweets. To add another celebrity, make a POST request to:

	```
	http://localhost:3000/celebrities/add/@username
	```
	where `username` is the Twitter handle of the celebrity you would like to add.


## Celebrities
  The application comes with 1 'celebrity' profile: [@germanatt][german_twitter]. If you want to add more profiles, you have two options:

### Auto-Lookup
1. 	Choose a person on Twitter to include as a 'celebrity'. Ensure this person is verified, has at least 10,000 followers, and has over 1,000 tweets.
2. Make a POST request to:

	```
	http://localhost:3000/celebrities/add/@username
	```
	where `username` is the Twitter handle of the celebrity you would like to add.

### SyncDB
  1. Choose a person to include as a 'celebrity'. You need at least 100 different words written by that person. Blog posts, tweets, text messages, emails will work.
  1. Get the profile by using the [Personality Insights][pi_docs] service with the text you have and save the json profile in the `profiles` folder. Make sure the file has the `.json` extension as in the examples provided.
  1. Start the app and make a POST request to: `http://localhost:3000/celebrities/syncdb`. It will repopulate the application database and add the new profile. Be aware that this command will erase all celebrities previously added to the database.

**Note**: In order to add celebrities, you must not be running the app in demo mode. Either run the app locally or set the `DEMO` environment variable to `0` when running the app on Bluemix.

## License

  This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE).

## Contributing

  See [CONTRIBUTING](CONTRIBUTING.md).

## Open Source @ IBM
  Find more open source projects on the [IBM Github Page](http://ibm.github.io/)

[bluemix]: https://console.ng.bluemix.net/
[node]: http://nodejs.org/
[mongodb]: http://docs.mongodb.org/manual/installation/
[twitter_app]: https://apps.twitter.com/app/new
[german_twitter]: https://twitter.com/germanatt
[pi_docs]: https://console.bluemix.net/docs/services/personality-insights/index.html
[vcap_environment]: https://console.bluemix.net/docs/services/watson/getting-started-variables.html
