require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const cors=require('cors');
app.set("trust proxy",1);
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('/{*path}', cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

const frontrouter=require('./customer/router/frontrouter.js');
const { sellrouter } = require("./seller/route/sellrouter.js");
const { default: mongoose } = require('mongoose');
const cartrouter = require("./customer/router/cartrouter.js");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const loginrouter = require("./customer/auth/loginrouter.js");
const orderrouter=require("./customer/router/orderrouter.js");
const pagerouter=require("./customer/router/detailpagerouter.js");
const profilerouter=require("./customer/router/profilerouter.js");
const searchrouter=require('./customer/router/searchrouter');
const rentrouter=require("./customer/router/rentrouter.js");
const DB_PATH =process.env.MONGO_URI;
const Item=require("./seller/model/item.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads",express.static(path.join(__dirname,'uploads')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store:MongoStore.create({
        mongoUrl:DB_PATH,
        collectionName:'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: "none",
        secure:true,
        httpOnly:true
    }
}));

app.get('/api/debug-session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    cookies: req.headers.cookie,
  });
});
app.use('/images', express.static(path.join(__dirname, '../app/customer/images')));


app.use((req, res, next) => {
    console.log(req.url, req.method, '| loggedIn:', req.session.isLoggedIn); 
    next();
});


app.delete('/api/orders/all', async (req, res) => {
  await Order.deleteMany({ user: req.session.user._id });
  res.json({ message: "Order history deleted" });
});


app.delete('/api/profile/delete', async (req, res) => {
  await User.findByIdAndDelete(req.session.user._id);
  req.session.destroy();
  res.json({ message: "Account deleted" });
});
const publicPaths = [
    '/api/login',
    '/api/logout',
    '/api/signup',
    '/api/sendotp',
    '/api/verifyotp',
    '/api/session',
    '/api/changepassword/sendotp',
    '/api/changepassword/verifyotp',
    '/api/changepassword/old',
    '/api/search',
    '/api/books',
    '/api/appliances',
    '/api/clothes',
    '/api/furniture',
    '/api/snacks',
    '/api/stationary',
    '/api/rent',
    '/api/detailpage',
];

app.use((req, res, next) => {
    if (req.method === 'OPTIONS') return next();
    const isPublic = publicPaths.some(p => req.path.startsWith(p));
    const isLoggedIn = req.session?.isLoggedIn;
    if (isLoggedIn || isPublic) return next();
    return res.status(401).json({ success: false, message: 'Not authenticated' });
});

app.use((req, res, next) => {
    console.log(req.method, req.path); 
    next();
});



app.use('/api',frontrouter);
app.use('/api',loginrouter);

app.use('/api',sellrouter);
app.use('/api',cartrouter);

app.use('/api',orderrouter);
app.use('/api',pagerouter);
app.use('/api',profilerouter);
app.use('/api',rentrouter);
app.use('/api',searchrouter);


mongoose.connect(DB_PATH).then(() => {
 
    console.log('connected to database');
    app.listen(process.env.PORT, () => {
        console.log(`Server is running at http://localhost:${process.env.PORT}`);
    });
}).catch(err => {
    console.log('Error while connecting to MONGO:', err);
});

