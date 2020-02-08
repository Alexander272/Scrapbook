const { Router } = require('express')
const fs = require('fs')
const auth = require('../middleware/auth')
const Albums = require('../models/albums')
const Photo = require('../models/photo')
const keys = require('../keys')

const readline = require('readline')
const { google } =  require ('googleapis')
const SCOPES = ['https://www.googleapis.com/auth/drive']
const TOKEN_PATH = 'token.json'

const Clarifai = require('clarifai')
const app = new Clarifai.App({
    apiKey: keys.CLARIFAI_KEY
})

const router = Router()

router.get('/', auth, (req, res) => {
    res.render('add', {
        title: 'Добавить фотографии',
        isAdd: 'true'
    })
})

router.post('/', auth, (req, res) => {
    if (req.files.length === 0) return res.redirect('/add')
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err)
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content), req.files, req, res)
    })
})

function authorize(credentials, files, req, res) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client);
        oAuth2Client.setCredentials(JSON.parse(token));
        files.forEach((file, idx) => {
            loadPhoto(oAuth2Client, file, req, res, idx, files.length)
        })
    });
}

async function loadPhoto(auth, file, req, res, idx, length) {
    try {
        const idPhoto = await uploadFile(auth, file)
        const concepts = await sendToModel(idPhoto)
        // console.log(concepts)
        await addToDb(req, concepts, idPhoto, file.filename)
        if (idx === length-1) res.redirect('/albums')
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

async function sendToModel (id) {
    try {
        const model = await app.models.initModel({ id: Clarifai.GENERAL_MODEL, version: "aa7f35c01e0642fda5cf400f543e7c40" })
        const response = await model.predict(`https://drive.google.com/uc?export=view&id=${id}`)
        const concepts = response['outputs'][0]['data']['concepts']
        return concepts
    } catch (error) {
        console.log(error)
    }
}

async function addToDb (req, concepts, idPhoto, filename) {
    const reservedAlbums = ['travel', 'car', 'people', 'animals', 'building', 'sky', 'nature', 'beach', 'fashion', 'family', 'fantasy']
    filename = filename.split('$')[1]
    idPhoto = 'https://drive.google.com/uc?export=view&id='+idPhoto
    try {
        const albums = await Albums.find({ 'user': req.user._id })
        let index = findIndex(concepts, reservedAlbums)
        if (index === -1) {
            reservedAlbums.push(concepts[0].name)
            index = reservedAlbums.length - 1
        }
        if (albums.length !== 0) {
            let isAlbumExists = false
            let currentAlbum
            albums.find((album, idx) => {
                if (album.name === reservedAlbums[index]) {
                    isAlbumExists = true
                    currentAlbum = albums[idx]
                    return true
                }
            })
            if (!isAlbumExists) {
                const newAlbum = new Albums({
                    name: reservedAlbums[index],
                    previewImg: idPhoto,
                    user: req.user
                })
                const albumId = await newAlbum.save()
                const newPhoto = new Photo({
                    name: filename,
                    imageSrc: idPhoto,
                    albumId
                })
                await newPhoto.save()
            } else {
                const newPhoto = new Photo({
                    name: filename,
                    imageSrc: idPhoto,
                    albumId: currentAlbum
                })
                await newPhoto.save()
            }
        } else {
            console.log('no albums')
            const newAlbum = new Albums({
                name: reservedAlbums[index],
                previewImg: idPhoto,
                user: req.user
            })
            const albumId = await newAlbum.save()
            const newPhoto = new Photo({
                name: filename,
                imageSrc: idPhoto,
                albumId
            })
            await newPhoto.save()
        }
    } catch (error) {
        console.log(error)
    }
}

function findIndex(array, reservedAlbums) {
    let index = -1
    for (let key in array) {
        let idx = reservedAlbums.indexOf(array[key].name)
        if (idx !== -1) {
            index = idx
            break
        }
    }
    return index
}

module.exports = router