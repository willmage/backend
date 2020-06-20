[![Run on Repl.it](https://repl.it/badge/github/PiSaucer/willmage-backend)](https://repl.it/github/PiSaucer/willmage-backend)

# Backend of Willmage
This is where all back-end processing such as image uploading is stored. Feel free to self host this - as long as you give us credit for the base code.
________
## Requirements
Node.js must be installed, and you must install the dependencies. You must create a Firebase app and make a Firebase Storage bucket.

### `.env` variables:
- `GOOGLE_APPLICATION_CREDENTIALS`: path of the Firebase service account json file
- `BUCKET`: the Firebase Storage bucket, for example `hello-world.appspot.com`
- `PORT`: the port to run the server on

Please keep in mind that we will not provide support for selfhosting.
