const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');

const app = express();

// Validate Environment Variables
if (!process.env.PORT)
{
    console.error('Error: PORT environment variable is not defined.');
    process.exit(1);
}

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://your-frontend-domain.com'], // Adjust to your allowed domains
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

// Error Handler
app.use(errorHandler);

// Graceful Shutdown
process.on('SIGINT', () =>
{
    console.log('Server shutting down...');
    process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
{
    console.log(`Server running on port ${PORT}`);
});
