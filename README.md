# Celebrities

The application uses IBM Watson [User Modeling][um_docs] and Twitter to find the celebrities that are similar to your personality. Twitter is being use to get the tweets for a given handler, the text from those tweets is send to User Modeling, who analyze the text and reply with a personality profile. That profile is compared to celebrity profiles to find the most similar.

The application is running in [Bluemix][bluemix].

Live demo: http://your-celebrity-match.mybluemix.net/

## Getting Started

This instructions will help you install the celebrities app in your local environment.

1. Get the code by downloading this [file][code_zip] or cloning the git repository with:

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

1. Update the Twitter and User Modeling credentials in `config/config.js`
    ```js
    {
      user_modeling: {
        url:      '<url>',
        username: '<username>',
        password: '<password>'
      },

      twitter: {
        consumer_key:       '<consumer_key>',
        consumer_secret:    '<consumer_secret>',
        access_token_key:   '<access_token_key>',
        access_token_secret:'<access_token_secret>'
      }
    }
    ```
    Instructions on how to create an app and get User Modeling credentials [here][um_cred].

    Instructions on how to create an app and get Twitter credentials [here][twitter_app].
1. Start the app

    ```sh
    $ node app.js
    ```

1. Update the database with the celebrities by going to:

    http://localhost:3000/celebrities/syncdb


## User Modeling Credentials
The credentials for the services are stored in the [VCAP_SERVICES][vcap_environment] environment variable. In order to get them you need to first create and bind the service to your application.

There are two ways to get the credentials, you can use Bluemix to access your app and view the `VCAP_SERVICES` there or you can run:

```sh
$ cf env <application-name>
```

Example output:
```sh
  System-Provided:
  {
  "VCAP_SERVICES": {
    "user_modeling": [{
        "credentials": {
          "password": "<password>",
          "url": "<url>",
          "username": "<username>"
        },
      "label": "user_modeling",
      "name": "um-service",
      "plan": "user_modeling_free_plan"
   }]
  }
  }
```

You need to copy `username`, `password`.

## Celebrities
  The application comes with two profiles: [@germanatt][german_twitter] and [@nfriedly][nathan_twitter]. If you want to add more profiles you will have to:
  1. Choose a person to include as 'celebrity'. You need at least 100 different words writted by that person, blog posts, tweets, text messages, emails will work.
  1. Get the profile by using the [User Modeling][um_docs] service with the text you have and save the json profile in the `profiles` folder. Make sure the file has the `.json` extension as in the examples provided.
  1. Start the app and go to: `http://localhost:3000/celebrities/syncdb`. It will repopulate the application database and add the new profile.

## License

  This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE).

## Contributing

  See [CONTRIBUTING](CONTRIBUTING.md).

## Open Source @ IBM
  Find more open source projects on the [IBM Github Page](http://ibm.github.io/)

[bluemix]: https://console.ng.bluemix.net/
[code_zip]: https://github.rtp.raleigh.ibm.com/gattana-us/yourcelebritymatch/repository/archive.zip
[node]: http://nodejs.org/download
[mongodb]: http://docs.mongodb.org/manual/installation/
[um_cred]: https://github.com/watson-developer-cloud/um-ruby/blob/master/README.md
[twitter_app]: https://apps.twitter.com/app/new
[german_twitter]: https://twitter.com/germanatt
[nathan_twitter]: https://twitter.com/nfriedly
[um_docs]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/systemuapi/