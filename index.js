const express = require('express')
const path = require('path')
const csurf = require('csurf')
const flash = require('connect-flash')
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const helmet = require('helmet')
const compression = require('compression')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)

const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const albumsRoutes = require('./routes/albums')
const albumRoutes = require('./routes/album')
const authRoutes = require('./routes/auth')

const varMiddleware = require('./middleware/variable')
const fileMiddleware = require('./middleware/file')
const userMiddleware = require('./middleware/user')
const errorHandler = require('./middleware/error')
const keys = require('./keys')

const app = express()

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require('./utils/hbs-helpers')
})

const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URL
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 12 // 12 hours
    },
    store
}))
app.use(fileMiddleware.array('photo'))
app.use(csurf())
app.use(flash())
app.use(helmet())
app.use(compression())
app.use(varMiddleware)
app.use(userMiddleware)

app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/albums', albumsRoutes)
app.use('/album', albumRoutes)
app.use('/auth', authRoutes)
app.use(errorHandler)



const PORT = process.env.PORT || 8000

async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URL, { 
            useNewUrlParser: true, 
            useFindAndModify: false,
            useUnifiedTopology: true
        })

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }
}
start()