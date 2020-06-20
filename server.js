const express = require('express');
const fileUpload = require('express-fileupload');
const multer = require('multer');
const fileType = require('file-type');
const {nanoid} = require('nanoid');
var admin = require("firebase-admin");

var serviceAccount = "serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://willmage-backend.firebaseio.com"
});

require('dotenv').config({path: __dirname + '/.env'})

const app = express();
const bucket = require('./firebase')

/* CONFIG */
const accepted_extensions = ['jpg', 'png', 'gif', 'jpeg', 'webp', 'ico'];

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use(fileUpload({
  createParentPath: true
}));

const upload = multer({
  limits: { 
    fileSize: 10 * 1024 * 1024,  // 5 MB upload limit
    files: 1                    // 1 file
  },
  fileFilter: (req, file, cb) => {
    // if the file extension is in our accepted list
    if (accepted_extensions.some(ext => file.originalname.endsWith("." + ext))) {
      return cb(null, true);
    }

    // otherwise, return error
    return cb(new Error('Only ' + accepted_extensions.join(", ") + ' files are allowed!'));
  }
});

// Middleware for validating file format
function validate_format(req, res, next) { 
  // If no files were selected
  if (!req.files) {
      return res.redirect('/')
  };

  // Image/mime validation
  const mime = fileType(req.files.image.data);
  if(!mime || !accepted_extensions.includes(mime.ext))
    return next(res.status(500).send('The uploaded file is not in ' + accepted_extensions.join(", ") + ' format!'));
  next();
}
// Index get route
app.get('/', async (req, res) => {
  const fileCount = (await bucket.getFiles())[0].length
  res.render('index', {fileCount})
});
app.get('/main.css', (req, res) => {
  res.sendFile(__dirname + '/assets/main.css')
});
app.get('/favicon.ico', (req, res) => {
  res.sendFile(__dirname + '/assets/favicon.ico')
});

//no script
app.get('/noscript', (req, res) => {
  res.send('<title>Willmage</title><h1>Please enable Javascript.</h1><a href="/">Okay, I did - now let me in!</a>')
})

//redirect for browser-access upload page
app.get('/upload', (req, res) => {
  res.redirect('/')
});
//discord link
app.get('/discord', (req, res) => {
  res.redirect('https://discord.gg/SS7cdCh')
});

//redirect for /up with no file name after it
app.get('/up', (req, res) => {
  res.redirect('/')
});

//stripe successful purchase
app.get('/success', (req, res) => {
  res.send('<title>Willmage</title><h1>Purchase success!</h1> Join our Discord for more information: <a href="https://willmage.com/discord">https://willmage.com/discord</a>')
});

app.get('/up/:file', async (req, res) => {
  const file = bucket.file(req.params.file)
  if(!(await file.exists())[0]) return res.status(404).send('<style>body {animation: sweep 1s ease-in-out;}</style><link rel="icon" href="https://cdn.glitch.com/583d7fb4-93c2-40df-9c7f-09f69aa9906e%2FPicsArt_06-09-02.10.21.png"><title>404 - Willmage</title><link rel="stylesheet" href="https://willm.xyz/404.css"><body style="margin: 0; padding: 0"><div class="no-signal-screen"><div class="dissortion"></div><p class="no-signal-screen__info">404 <span style="color:white">-</span> File Not Found</p></div></body>')
  file.createReadStream().pipe(res)
});

// Upload post route 
app.post('/upload', upload.single('image'), validate_format, async (req, res, next) => {
  const upFile = req.files.image
  const mime = fileType(req.files.image.data)
  const id = nanoid(Math.floor(Math.random() * 6) + 4)
  await bucket.file(`${id}.${mime.ext}`).save(upFile.data, {contentType: upFile.mimetype, public: true, resumable: false}).catch(console.error)
  res.redirect(`/up/${id}.${mime.ext}`)
});

//pasta lol
app.get('/pasta', (req, res) => {
res.send('pasta mhm')

})

//404 page
app.use(function(req, res, next) {
    res.status(404).send('<style>body {animation: sweep 1s ease-in-out;}</style><link rel="icon" href="https://cdn.glitch.com/583d7fb4-93c2-40df-9c7f-09f69aa9906e%2FPicsArt_06-09-02.10.21.png"><title>404 - Willmage</title><link rel="stylesheet" href="https://willm.xyz/404.css"><body style="margin: 0; padding: 0"><div class="no-signal-screen"><div class="dissortion"></div><p class="no-signal-screen__info">404 <span style="color:white">-</span> Page Not Found</p></div></body>');
});

// Server listener
const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
