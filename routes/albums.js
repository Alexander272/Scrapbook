const {Router} = require('express')
const router = Router()
const auth = require('../middleware/auth')
const Albums = require('../models/albums')
const Photo = require('../models/photo')

const fs = require('fs')
const { google } =  require ('googleapis')
const SCOPES = ['https://www.googleapis.com/auth/drive']
const TOKEN_PATH = 'token.json'

router.get('/', auth, async (req, res) => {
    const albums = await Albums.find({ 'user': req.user._id }).sort({ date: -1 })
    res.render('albums', {
        title: 'Мои альбомы',
        isAlbums: 'true',
        albums
    })
})

router.post('/add', auth, async (req, res) => {
    if (!req.body.name) return res.redirect('/albums')
    const newAlbum = new Albums({
        name: req.body.name,
        previewImg: req.body.imageSrc,
        user: req.user
    })
    await newAlbum.save()
    res.redirect('/albums')
})

router.post('/update', auth, async (req, res) => {
    if (!req.body.name) return res.redirect('/albums')
    const album = await Albums.findOne({ name: req.body.lastname })
    let previewImg = ''
    if (!req.body.check) {
        if (!req.body.imageSrc) previewImg = undefined
        else previewImg = req.body.imageSrc
    } else {
        previewImg = album.previewImg
    }
    await album.updateOne({ name: req.body.name, previewImg })
    res.redirect('/albums')
})

router.post('/remove', auth, async (req, res) => {
    const album = await Albums.findOne({ 'user': req.user._id, 'name': req.body.name })
    const photos = await Photo.find({ albumId: album._id })
    await album.deleteOne()
    if (photos.length > 0) {
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err)
            // Authorize a client with credentials, then call the Google Drive API.
            authorize(JSON.parse(content), photos, req, res)
        })
    } else {
        res.redirect('/albums')
    }
})

function authorize(credentials, photos, req, res) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client);
        oAuth2Client.setCredentials(JSON.parse(token));
        photos.forEach((photo, idx) => {
            deleteFile(oAuth2Client, photo, req, res, idx, photos.length)
        })
    });
}

async function deleteFile(auth, photo, req, res, idx, length) {
    try {
        const fileId = photo.imageSrc.split('id=')[1]
        const drive = google.drive({version: 'v3', auth});
        await drive.files.delete({
            fileId: fileId
        })
        await photo.remove()
        if (idx === length-1) res.redirect('/albums')
    } catch (error) {
        console.log(error)
    }
}

function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

module.exports = router