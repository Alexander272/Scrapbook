const {Router} = require('express')
const router = Router()
const auth = require('../middleware/auth')
const Album = require('../models/albums')
const Photo = require('../models/photo')

const fs = require('fs')
const { google } =  require ('googleapis')
const SCOPES = ['https://www.googleapis.com/auth/drive']
const TOKEN_PATH = 'token.json'

router.get('/:title', auth, async (req, res) => {
    const title = req.params.title
    const albumTitle = `Альбом ${title}`
    const currentAlbum = await Album.findOne({ name: title, user: req.user._id })
    const numberOfPhotos = await Photo.countDocuments({ albumId: currentAlbum._id })
    const nextPage = +req.query.page + 1
    let img, isFirstPage = false, photosOfPage = 9
    let finalPage = Math.ceil(numberOfPhotos / 9)
    if (finalPage === 0) finalPage = 1
    const skip = +req.query.page - 1
    if (skip === 0) {
        isFirstPage = true
        photosOfPage = 8
    }
    if (skip < finalPage) {
        img = await Photo.find({ albumId: currentAlbum._id })
            .sort({ date: -1 })
            .skip(skip*photosOfPage)
            .limit(photosOfPage)
    }
    
    const album = {
        title: currentAlbum.name,
        img,nextPage,
        prevPage: nextPage - 2,
        isFinalPage: (skip + 1) >= finalPage,
        isFirstPage: skip === 0 
    }
    if (req.query.page > finalPage) return res.redirect(`/album/${title}?page=${finalPage}`)
    res.render('album', {
        title: albumTitle,
        isAlbum: true,
        album,
        albumError: req.flash('albumError'),
        isFirstPage
    })
})

router.post('/setas/:title', auth, async (req, res) => {
    const title = req.params.title
    const album = await Album.findOne({ user: req.user._id, name: title })
    const photo = await Photo.findById({ _id: req.body.id })
    album.previewImg = photo.imageSrc
    await album.save()
    res.redirect('/albums')
})

router.post('/move/:title', auth, async (req, res) => {
    const title = req.params.title
    const album = await Album.findOne({ user: req.user._id, name: req.body.name.toLowerCase() })
    if (!album) {
        const pageNumber = +req.query.page
        req.flash('albumError', 'Альбом с таким названием не найден')
        return res.status(404).redirect(`/album/${title}?page=${pageNumber}`)
    }
    const photo = await Photo.findById({ _id: req.body.id })
    photo.albumId = album._id
    await photo.save()
    res.redirect('/albums')
})

router.post('/somemove/:title', auth, async (req, res) => {
    const title = req.params.title
    const album = await Album.findOne({ user: req.user._id, name: req.body.name.toLowerCase() })
    if (!album) {
        const pageNumber = +req.query.page
        req.flash('albumError', 'Альбом с таким названием не найден')
        return res.status(404).redirect(`/album/${title}?page=${pageNumber}`)
    }
    ids = req.body.id.split(',')
    const photos = await Photo.find({ _id: ids})
    photos.forEach(async (photo, idx) => {
        photo.albumId = album._id
        await photo.save()
        if (idx === photos.length -1) res.redirect('/albums')
    })
})

router.post('/remove/:title', auth, async (req, res) => {
    const photo = await Photo.findById({ _id: req.body.id })
    const photos = [photo]
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err)
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content), photos, req, res, false)
    })
})

router.post('/someremove/:title', auth, async (req, res) => {
    ids = req.body.id.split(',')
    const photos = await Photo.find({ _id: ids})
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err)
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content), photos, req, res, false)
    })
})

router.post('/add/:title', auth, async (req, res) => {
    if (req.files.length === 0) return res.redirect(`/album/${req.body.title}?page=1`)
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err)
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content), req.files, req, res, true)
    })
})

function authorize(credentials, photos, req, res, isAdd) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client);
        oAuth2Client.setCredentials(JSON.parse(token));
        if (!isAdd) deleteFile(oAuth2Client, photos, req, res)
        else loadPhoto(oAuth2Client, photos, req, res)
    });
}

function deleteFile(auth, photos, req, res) {
    try {
        const title = req.params.title
        const pageNumber = +req.query.page
        photos.forEach(async (photo, index) => {
            const fileId = photo.imageSrc.split('id=')[1]
            const drive = google.drive({version: 'v3', auth});
            await drive.files.delete({
                fileId: fileId
            })
            await photo.remove()
            if (index === photos.length-1) res.redirect(`/album/${title}?page=${pageNumber}`)
        })
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

async function loadPhoto(auth, photos, req, res) {
    try {
        const title = req.params.title
        const albumId = await Album.findOne({ name: title })
        photos.forEach(async (photo, index) => {
            const idPhoto = await uploadFile(auth, photo)
            const imageSrc = 'https://drive.google.com/uc?export=view&id='+idPhoto
            const filename = photo.filename.split('$')[1]
            const newPhoto = new Photo({
                name: filename,
                imageSrc,
                albumId
            })
            await newPhoto.save()
            if (index === photos.length-1) res.redirect(`/album/${title}?page=1`)
        })
    } catch (error) {
        console.log(error)
    }
}

async function uploadFile(auth, file) {
    try {
        const drive = google.drive({version: 'v3', auth});
        const fileMetadata = {
            name: file.filename,
            parents: ['1oEMkixq2puYv43B3ZoN4lMJdY9GAgVpf']
        }
        const media = {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path)
        }
        const res = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        })
        deleteFiles(file)
        return res.data.id
    } catch (error) {
        console.log(error)
    }
}

function deleteFiles(file) {
    fs.unlink(file.path, err => { if (err) console.log(err) } )
}

module.exports = router