# your-celebrity-match
[![Build Status](https://travis-ci.org/watson-developer-cloud/your-celebrity-match.svg?branch=master)](https://travis-ci.org/watson-developer-cloud/your-celebrity-match)

The application uses IBM Watson [Personality Insights][pi_docs] and Twitter to find the celebrities that are similar to your personality. Twitter is being use to get the tweets for a given handler, the text from those tweets is send to Personality Insights, who analyze the text and reply with a personality profile. That profile is compared to celebrity profiles to find the most similar.

Live demo: http://your-celebrity-match.mybluemix.net/

Give it a try! Click the button below to fork into IBM DevOps Services and deploy your own copy of this application on Bluemix.  
[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/watson-developer-cloud/yourcelebritymatch)  
**Note**: Once you deploy the application in Bluemix you will need to do some extra steps described below to setup the database and Twitter API credentials.

# API Reference:
The application uses [The Personality Insights API](http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/personality-insights/api/v2/)

# How it works

Steps |
:------------: |
<img src="http://s7.postimg.org/odqyly6vv/1_enter_handle.gif" alt="You input your Twitter handle" width="100px" height="100px"><br>You input your Twitter handle.<br> |
<img src="http://s7.postimg.org/ag8sgn8t7/2_twitter_feed.gif" alt="Calls the Twitter API." width="100px" height="100px"><br> Calls the Twitter API to get the latest 2300 tweets from your public feed.<br> |
<img src="http://s7.postimg.org/ltvbrujbv/3_UM_api.gif" alt="Calls the Personality Insights API." width="100px" height="100px"><br> Calls the Personality Insights API to analyze the language in your tweets and apply it to a spectrum of characteristics.<br> |
<img src="http://s7.postimg.org/nmy8g64ij/4_compare_results.gif" alt="Compares your Personality Insights profile to 232 celebrity profiles analyzed with the service." width="100px" height="100px"><br> Compares your Personality Insights profile to 232 celebrity profiles analyzed with the service.<br> |
<img src="http://s7.postimg.org/we59afntn/5_celeb_match.png" alt="Sorts your matches and shows you the highest and lowest. These are calculated by the euclidean distance between the two." width="100px" height="100px"><br> Sorts your matches and shows you the highest and lowest. These are calculated by the euclidean distance between the two.<br> |


## Getting Started

This instructions will help you install the celebrities app in your local environment.

1. Clone the repository with:

    ```sh
    $ git clone git@github.com:watson-developer-cloud/yourcelebritymatch.git
    ```

1. Install [node][node] (use v0.10.31)

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

1. You need some credentials to use Twitter API, Personality Insights and MongoDC:
  * Get credentials to use Personality Insights, instructions [here][pi_cred].  
  * Create a **FREE** Mongodb database using [MongoLab](https://mongolab.com).  
  * Create a Twitter app and get the API credentials [here][twitter_app].
1. Update the Twitter, MongoDB and Personality Insights credentials in `config/config.js`

    ```js
    mongodb: process.env.MONGODB || 'mongodb://localhost/celebs',

    {
      personality_insights: {
        url:      '<url>',
        username: '<username>',
        password: '<password>'
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


## Personality Insights Credentials
The credentials for the services are stored in the [VCAP_SERVICES][vcap_environment] environment variable. In order to get them you need to first create and bind the service to your application.

There are two ways to get the credentials, you can use Bluemix to access your app and view the `VCAP_SERVICES` there or you can run:

```sh
$ cf env <application-name>
```

Example output:

```
  System-Provided:
  {
  "VCAP_SERVICES": {
    "personality_insights": [{
        "credentials": {
          "password": "<password>",
          "url": "<url>",
          "username": "<username>"
        },
      "label": "personality_insights",
      "name": "personality-insights-service",
      "plan": "IBM Watson Personality Insights Monthly Plan"
   }]
  }
  }
```

You need to copy `username`, `password`.

## Celebrities
  The application comes with two 'celebrity' profiles: [@germanatt][german_twitter] and [@nfriedly][nathan_twitter]. If you want to add more profiles, you have two options:

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
[node]: http://nodejs.org/download
[mongodb]: http://docs.mongodb.org/manual/installation/
[pi_cred]: https://github.com/watson-developer-cloud/um-ruby/blob/master/README.md
[twitter_app]: https://apps.twitter.com/app/new
[german_twitter]: https://twitter.com/germanatt
[nathan_twitter]: https://twitter.com/nfriedly
[pi_docs]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/personality-insights/
[vcap_environment]: https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/getting_started/#VcapEnvVar
