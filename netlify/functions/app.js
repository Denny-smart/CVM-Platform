// Import modules
const express = require('express');
const path = require('path');
const serverless = require('serverless-http'); // Required for serverless deployment
require('dotenv').config();

const authRoutes = require('../../routes/auth');

const app = express();

// Register view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public')); // Adjusted path for Netlify structure

// Set up middleware
app.use(express.static(path.join(__dirname, '../views'))); // Serves static files from the 'views' directory
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

app.get('/organizations', (req, res) => {
    res.render('org', { title: 'ForOrganizations' });
});

app.get('/volunteers', (req, res) => {
    res.render('vol', { title: 'ForVolunteers' });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'CreateAccount' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contacts' });
});

// Handle other errors (e.g., server errors)
app.use((err, req, res, next) => {
    console.error(err.stack);  // Log error stack
    res.status(500).send('Something went wrong!');
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});

// Export as a serverless function
module.exports.handler = serverless(app);
