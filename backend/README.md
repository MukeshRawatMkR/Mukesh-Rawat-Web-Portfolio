# Portfolio Backend API

A professional portfolio backend API built with Node.js, Express.js, and MongoDB following industry-standard practices including REST API design, MVC architecture, security best practices, and comprehensive error handling.

## 🚀 Features

### Core Functionality
- **Projects Management**: CRUD operations for portfolio projects
- **Contact Form**: Handle contact form submissions with validation
- **Authentication**: JWT-based admin authentication
- **Admin Dashboard**: Protected routes for content management

### Security Features
- **Helmet**: Security headers protection
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Prevent abuse and spam
- **Input Validation**: Comprehensive data validation and sanitization
- **XSS Protection**: Cross-site scripting prevention
- **NoSQL Injection Protection**: MongoDB injection prevention
- **Password Hashing**: Bcrypt for secure password storage
- **JWT Authentication**: JSON Web Token based authentication

### Performance & Reliability
- **Compression**: Response compression for better performance
- **Logging**: Winston & Morgan for comprehensive logging
- **Error Handling**: Centralized error handling middleware
- **Database Optimization**: Proper indexing and query optimization
- **Graceful Shutdown**: Proper server and database connection cleanup

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi & Express-validator
- **Security**: Helmet, CORS, Rate limiting, XSS protection
- **Logging**: Winston & Morgan
- **Development**: Nodemon for auto-restart

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── contactController.js # Contact form handling
│   └── projectController.js # Project CRUD operations
├── middlewares/
│   ├── auth.js             # Authentication middleware
│   └── errorHandler.js     # Global error handling
├── models/
│   ├── User.js             # User model with authentication
│   ├── Project.js          # Project model with validation
│   └── ContactMessage.js   # Contact message model
├── routes/
│   ├── authRoutes.js       # Authentication endpoints
│   ├── contactRoutes.js    # Contact form endpoints
│   └── projectRoutes.js    # Project CRUD endpoints
├── scripts/
│   └── seed.js             # Database seeding script
├── utils/
│   └── logger.js           # Winston logger configuration
├── logs/                   # Log files directory
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── server.js               # Main application entry point
└── README.md               # This file
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### 1. Clone & Install
```bash
# Clone the repository (or extract the backend folder)
cd backend

# Install dependencies
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configurations
nano .env
```

### 3. Required Environment Variables
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/portfolio

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex
JWT_EXPIRE=7d

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Database Setup
```bash
# Seed the database with sample data
npm run seed

# Or clear existing data first
npm run seed -- --clear
```

### 5. Start the Server
```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication (`/api/auth`)
```http
POST   /login                 # Admin login
GET    /me                    # Get current user profile
PUT    /profile               # Update user profile
PUT    /change-password       # Change password
POST   /logout                # Logout user
```

#### Projects (`/api/projects`)
```http
GET    /                      # Get all projects (public)
GET    /:id                   # Get single project (public)
POST   /                      # Create project (admin)
PUT    /:id                   # Update project (admin)
DELETE /:id                   # Delete project (admin)
GET    /stats                 # Get project statistics (admin)
```

#### Contact (`/api/contact`)
```http
POST   /                      # Submit contact form (public)
GET    /messages              # Get all messages (admin)
GET    /messages/:id          # Get single message (admin)
PATCH  /messages/:id          # Update message status (admin)
DELETE /messages/:id          # Delete message (admin)
GET    /stats                 # Get contact statistics (admin)
```

#### Health Check
```http
GET    /api/health            # Server health status
```

### Sample API Responses

#### Get Projects
```json
{
  "status": "success",
  "results": 5,
  "totalResults": 5,
  "totalPages": 1,
  "currentPage": 1,
  "data": {
    "projects": [
      {
        "_id": "...",
        "title": "E-Commerce Platform",
        "description": "A full-stack e-commerce platform...",
        "imageURL": "https://...",
        "techStack": ["React", "Node.js", "MongoDB"],
        "githubURL": "https://github.com/...",
        "liveDemoURL": "https://...",
        "featured": true,
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Contact Form Submission
```json
{
  "status": "success",
  "message": "Your message has been sent successfully! I'll get back to you soon.",
  "data": {
    "contactMessage": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello, I'd like to discuss...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Login Response
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "username": "admin",
      "email": "admin@portfolio.com",
      "role": "admin",
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 🛡️ Security Features

### Input Validation
- All inputs are validated using Joi and express-validator
- XSS protection with data sanitization
- NoSQL injection prevention
- File upload size limits

### Rate Limiting
- General API: 100 requests per 15 minutes
- Contact form: 5 submissions per 15 minutes
- Configurable limits via environment variables

### Authentication & Authorization
- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- Account lockout after failed attempts
- Role-based access control

### HTTP Security
- Helmet.js for security headers
- CORS configuration for cross-origin requests
- Compression for better performance
- Request logging for audit trails

## 📊 Logging

### Log Levels
- **Error**: Error messages and stack traces
- **Warn**: Warning messages
- **Info**: General information
- **Debug**: Detailed debugging information

### Log Files
- `logs/error.log`: Error-level logs only
- `logs/combined.log`: All log levels
- Console output in development mode

### Log Rotation
- Maximum file size: 5MB
- Maximum files kept: 5
- Automatic rotation when size limit reached

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use a strong, unique `JWT_SECRET`
3. Configure production MongoDB URI
4. Set up proper CORS origins
5. Configure rate limiting for production load

### Deployment Platforms

#### Render.com
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy with automatic builds

#### Railway.app
1. Connect repository or deploy via CLI
2. Configure environment variables
3. Railway automatically detects Node.js apps

#### DigitalOcean App Platform
1. Create new app from GitHub
2. Configure build and run commands
3. Set environment variables

#### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### MongoDB Atlas Setup
1. Create cluster on MongoDB Atlas
2. Configure network access (IP whitelist)
3. Create database user
4. Get connection string for `MONGO_URI`

## 🧪 Testing

### Manual Testing
```bash
# Test server health
curl http://localhost:5000/api/health

# Test contact form
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message"
  }'

# Test admin login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your-admin-password"
  }'
```

### Automated Testing (Future Enhancement)
The project structure supports adding Jest and Supertest for automated testing:
```bash
npm test  # Run test suite (to be implemented)
```

## 🔧 Development

### Available Scripts
```bash
npm start         # Start production server
npm run dev       # Start development server with nodemon
npm run seed      # Seed database with sample data
npm run lint      # Run ESLint (if configured)
npm run lint:fix  # Fix ESLint issues automatically
```

### Adding New Features
1. Create new model in `models/` if needed
2. Add controller logic in `controllers/`
3. Define routes in `routes/`
4. Add validation rules
5. Update API documentation

### Database Schema Changes
1. Update model definitions
2. Run database migration if needed
3. Update seed script with new sample data
4. Test with existing data

## 📈 Monitoring & Maintenance

### Log Monitoring
- Check `logs/error.log` for application errors
- Monitor `logs/combined.log` for general activity
- Set up log aggregation for production (e.g., ELK stack)

### Database Monitoring
- Monitor MongoDB connection health
- Check database performance metrics
- Regular backup procedures

### Security Monitoring
- Monitor failed authentication attempts
- Check rate limiting effectiveness
- Regular security updates for dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper tests
4. Update documentation as needed
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check this README for common solutions
2. Review the API documentation
3. Check application logs for errors
4. Create an issue in the repository

## 🔄 Changelog

### v1.0.0 (Initial Release)
- Complete REST API with MVC architecture
- JWT authentication system
- Project and contact management
- Comprehensive security features
- Production-ready logging and error handling
- Database seeding and sample data
- Detailed documentation and setup instructions