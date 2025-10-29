# MediCare API Endpoints

## Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://your-railway-app.up.railway.app`

## Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

## User Endpoints
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/send-otp` - Send OTP for verification
- `POST /api/user/verify-otp` - Verify OTP

## Doctor Endpoints
- `GET /api/doctor/list` - Get all doctors
- `GET /api/doctor/:id` - Get doctor by ID
- `POST /api/doctor/register` - Doctor registration
- `PUT /api/doctor/:id` - Update doctor profile

## Appointment Endpoints
- `POST /api/appointment/book` - Book appointment
- `GET /api/appointment/user/:userId` - Get user appointments
- `GET /api/appointment/doctor/:doctorId` - Get doctor appointments
- `PUT /api/appointment/:id` - Update appointment
- `DELETE /api/appointment/:id` - Cancel appointment

## Message Endpoints
- `POST /api/messages/send` - Send message
- `GET /api/messages/:conversationId` - Get conversation messages
- `GET /api/messages/conversations/:userId` - Get user conversations

## Frontend Routes (React Router)
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard
- `/doctors` - Doctor listing
- `/appointments` - Appointment management
- `/messages` - Chat/messaging
- `/profile` - User profile