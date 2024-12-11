const db = require('../config/db');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

exports.registerUser = async (request, response) => {
    const { email, 
        password, 
        first_name, 
        last_name, 
        user_type,
        location,
        contact_number  } = request.body;
    
    try {
        // Input validation
        if (!email || !password) {
            return response.status(400).json({ message: 'All fields are required' });
        }
        
        if (!validator.isEmail(email)) {
            return response.status(400).json({ message: 'Invalid email format' });
        }
        
        if (password.length < 8) {
            return response.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Check if user exists
        const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return response.status(400).json({ message: 'User already exists!' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert record into db table
        const [result] = await db.execute(
            'INSERT INTO users (email, password, created_at) VALUES (?, ?, ?, NOW())',
            [email, hashedPassword]
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: result.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        response.status(201).json({
            message: 'User registered successfully!',
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        response.status(500).json({ message: 'An error occurred during registration' });
    }
};


exports.loginUser = async (request, response) => {
    const { email, password } = request.body;
    
    try {
        // Input validation
        if (!email || !password) {
            return response.status(400).json({ message: 'Email and password are required' });
        }

        if (!validator.isEmail(email)) {
            return response.status(400).json({ message: 'Invalid email format' });
        }

        // Check if user exists
        const [users] = await db.execute(
            'SELECT id, email, password, login_attempts, last_login_attempt FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return response.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Check for too many login attempts
        if (user.login_attempts >= 5 && 
            new Date(user.last_login_attempt).getTime() + 15 * 60 * 1000 > Date.now()) {
            return response.status(429).json({
                message: 'Too many login attempts. Please try again later.'
            });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            // Update login attempts
            await db.execute(
                'UPDATE users SET login_attempts = login_attempts + 1, last_login_attempt = NOW() WHERE id = ?',
                [user.id]
            );
            
            return response.status(400).json({ message: 'Invalid credentials' });
        }

        // Reset login attempts on successful login
        await db.execute(
            'UPDATE users SET login_attempts = 0, last_login_attempt = NULL, last_login = NOW() WHERE id = ?',
            [user.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        response.status(200).json({
            message: 'Login successful!',
            user: {
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        response.status(500).json({ message: 'An error occurred during login' });
    }
};

// Middleware to verify JWT token
exports.verifyToken = async (request, response, next) => {
    try {
        const token = request.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return response.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.user = decoded;
        next();
    } catch (error) {
        return response.status(401).json({ message: 'Invalid or expired token' });
    }
};