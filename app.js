//import
const express = require('express');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

//register view engine
app.set('view engine','ejs');
app.set('views','public');

// //set-up middleware
app.use(express.static('views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes)

app.get('/', (req, res) => {
    res.render('index', {title: 'Home'});
});

app.get('/form', (req, res) => {
    res.render('register', {title: 'Signup'});
});

app.get('/login', (req, res) => {
    res.render('login', {title: 'Login'});
});

app.get('/contact', (req, res) => {
    res.render('contact', {title: 'Contacts'});
});


app.use((req, res) => {
    res.status(404).render('404', {title: '404'});
});


const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running at :${PORT}`)
});