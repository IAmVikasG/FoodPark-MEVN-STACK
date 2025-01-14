const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const sliderRoutes = require('./routes/slider.routes');
const roleRoutes = require('./routes/role.routes');
const permissionRoutes = require('./routes/permission.routes');
const couponRoutes = require('./routes/coupon.routes');

const app = express();

// Validate Environment Variables
if (!process.env.PORT)
{
    console.error('Error: PORT environment variable is not defined.');
    process.exit(1);
}
app.use(morgan('dev'));
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
app.use('/api/sliders', sliderRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/coupons', couponRoutes);

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
