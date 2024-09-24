// WORK ON LOG-OUT AND DISPLAY ERROR Socket.IO FUNCTIONS


// Import required libraries
import http from 'http';
import path from 'path';
import cookie from 'cookie';
import crypto from 'crypto';
import express from 'express';
import JWT from 'jsonwebtoken';
import mongoose from 'mongoose';
import passport from 'passport';
import { Server } from 'socket.io';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Load Chat Database Model
import Chat from './schemas/chat';

// Typescript interface for environment variables
interface process_env {
    URL: string;
    MONGODB_URL: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    JWT_KEY: string;
    EMAIL_SECRET_0: string;
    EMAIL_SECRET_1: string;
}

// Typescript interface for Google Authentication Data
interface user_interface {
    _json: {
        email: string;
        name: string;
    }
}

// Typescript interface for user JWT token
interface jwt_user {
    name: string;
    email: string;
    id: string;
}

// Use Typescript interface for process.env
const ENV = process.env as unknown as process_env;
mongoose.connect(ENV.MONGODB_URL);

// Create express server
const app = express();

// Create parent http server
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server);

// Listen for Socket.io connection
io.on('connection', async (socket) => {
    // Fetch all old chats uptil the limit 10
    Chat.find({}).select('-email -__v').sort({ ts: -1 }).limit(20).then(
        chats => {
            socket.emit('chats', chats);
        }
    );

    socket.on('request-chats', (ts: number) => {
        // Fetch even more (20) older chats when the user requests for them
        Chat.find({ ts: { $lt: ts } }).select('-email -__v').sort({ ts: -1 }).limit(20).then(
            chats => {
                socket.emit('chats', chats);
            }
        );
    });

    // Listen for messages
    socket.on('message', async (msg) => {
        // Check if there are cookies present
        if (socket.handshake.headers.cookie != null) {
            // Parse the cookies
            const cookies = cookie.parse(socket.handshake.headers.cookie);
            // Check if user is logged in by checking if a session is present in the parsed cookies
            if (cookies.session != null) {
                try {
                    // Verify the authenticity of the JWT
                    const user = JWT.verify(cookies.session, ENV.JWT_KEY) as jwt_user;

                    // Aquire timestamp of the sent message
                    const ts = new Date().valueOf();

                    // Check if more than 10K documents are present and delete the older ones if it crosses 10K
                    const DocumentCount = await Chat.countDocuments({});
                    if (DocumentCount >= 10000) {
                        // Find the oldest chat since the limit is 5000
                        Chat.findOne({}).sort({ ts: 1 }).limit(1).then(
                            async oldestChat => {
                                if (oldestChat != null) {
                                    // Delete the oldest chat
                                    await Chat.deleteOne({ _id: oldestChat._id });
                                }
                            });
                    }

                    // Store the message in the database
                    const messageID = crypto.randomUUID().replaceAll('-', '');
                    await new Chat({
                        _id: messageID,
                        userID: user.id,
                        email: user.email,
                        name: user.name,
                        ts: ts,
                        content: {
                            text: msg
                        }
                    }).save();

                    // Send the message to the whole server
                    io.emit('chat', {
                        _id: messageID,
                        name: user.name,
                        ts: ts,
                        userID: user.id,
                        content: {
                            text: msg
                        }
                    });
                } catch (err) {
                    // In case JWT has been forged
                    if (err instanceof JWT.JsonWebTokenError && err.message === 'invalid signature') {
                        socket.emit('log-out');
                    } else {
                        // Make client aware that something wrong happened in the backend
                        console.error(err);
                        socket.emit('display-message', 'Sorry, An Unknown Error Occured!');
                    }
                }
            } else {
                // Make client aware that there their session cookie is missing
                socket.emit('display-message', 'Your session cookie is missing!');
            }
        } else {
            // Make client aware that there their cookies is missing
            socket.emit('display-message', 'Your session cookie is missing!');
        }
    });

    // Handle delete message
    socket.on('delete', async (msg_id) => {
        // Check if there are cookies present
        if (socket.handshake.headers.cookie != null) {
            // Parse the cookies
            const cookies = cookie.parse(socket.handshake.headers.cookie);
            // Check if user is logged in by checking if a session is present in the parsed cookies
            if (cookies.session != null) {
                try {
                    // Verify the authenticity of the JWT
                    const user = JWT.verify(cookies.session, ENV.JWT_KEY) as jwt_user;
                    const fetchMessage = await Chat.findOne({ _id: msg_id });
                    if (fetchMessage != null) {
                        if (fetchMessage.email == user.email) {
                            // Update that the message has been deleted. Also make a copy of the original message just in case
                            await Chat.updateOne({ _id: msg_id }, { content: { text: '[message deleted]' }, original: fetchMessage.content != null ? fetchMessage.content.text : null });
                            io.emit('update-message', { id: msg_id, content: { text: '[message deleted]' } });
                        } else {
                            socket.emit('display-message', 'You are unauthorized to perform this action!');
                        }
                    } else {
                        socket.emit('display-message', 'Invalid Message ID!');
                    }
                } catch (err) {
                    // In case JWT has been forged
                    if (err instanceof JWT.JsonWebTokenError && err.message === 'invalid signature') {
                        socket.emit('log-out');
                    } else {
                        // Make client aware that something wrong happened in the backend
                        console.error(err);
                        socket.emit('display-message', 'Sorry, An Unknown Error Occured!');
                    }
                }
            } else {
                // Make client aware that there their session cookie is missing
                socket.emit('display-message', 'Your session cookie is missing!');
            }
        } else {
            // Make client aware that there their cookies is missing
            socket.emit('display-message', 'Your session cookie is missing!');
        }
    });
});

// Use the EpressJS extentions
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'icon-32x32.png')));

// Define Google Authentication Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: ENV.GOOGLE_CLIENT_ID,
            clientSecret: ENV.GOOGLE_CLIENT_SECRET,
            callbackURL: ENV.URL + "/auth/google/cb"
        },
        function (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) {
            return done(null, profile);
        }
    )
);

// Send client main home UI
app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, 'views', 'index.html'));
    const theme = req.cookies.theme || 'light';
    res.render('index', { theme: theme });
});

// Authentication path
app.get('/auth', passport.authenticate('google', { scope: ['email', 'profile'], session: false }));

// Handle authentication callback
app.get('/auth/google/cb', passport.authenticate('google', { session: false }),
    function (req, res) {
        const user = req.user as user_interface;
        // Check if user object is present in `req`
        if (user != null) {
            // Set session cookie
            res.cookie('session', JWT.sign({
                id: crypto.createHash('sha256').update(ENV.EMAIL_SECRET_0 + user._json.email + ENV.EMAIL_SECRET_1).digest('hex'),
                email: user._json.email,
                name: user._json.name
            }, ENV.JWT_KEY), {
                // Expire in 6 Months
                maxAge: 1.577e+10,
                secure: true
            });

            res.cookie('id', crypto.createHash('sha256').update(ENV.EMAIL_SECRET_0 + user._json.email + ENV.EMAIL_SECRET_1).digest('hex'),
                {
                    // Expire in 6 Months
                    maxAge: 1.577e+10,
                    secure: true
                });

            // Close the window as user has been authenticated succesfully
            res.send('<script>window.close();</script>');
        } else {
            // Display the error message and then close the window
            res.send('Failed To Authenticate!<br>This page will automatically close...<script>setTimeout(()=>{window.close();}, 5000)</script>');
        }
    });

app.get('/set/theme/:mode', (req, res) => {
    res.cookie('theme', req.params.mode, {
        maxAge: 3.156e+10
    });
    res.end();
});

// Redirect all unknown pages to / (404 not found case)
app.all('*', (req, res) => {
    res.redirect('/');
});

// Start the server
server.listen(3000, () => {
    console.log('[LOG] Server Is Running On Port 3000');
});