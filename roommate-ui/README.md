# Roommate Matcher - React Frontend

A modern React application for finding and connecting with potential roommates.

## 🚀 Technologies Used

- **React** - Frontend framework
- **React Router** - Navigation and routing
- **Axios** - HTTP client for API calls
- **React Bootstrap** - UI components
- **React Icons** - Icon library
- **SweetAlert2** - Beautiful alerts and notifications

## 📁 Project Structure

```
src/
├── components/
│   ├── Navigation.js    # Navigation bar
│   ├── Home.js         # Landing page
│   ├── Login.js        # Login form
│   ├── Register.js     # Registration form
│   └── Dashboard.js    # User dashboard
├── App.js              # Main app component
├── App.css             # Global styles
└── index.js            # App entry point
```

## 🛠️ Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 🔗 API Endpoints

The app connects to a Spring Boot backend at `http://localhost:8080`:

- `POST /Auth/login` - User login
- `POST /Auth/register` - User registration
- `GET /users/me` - Get current user profile

## ✨ Features

- **Responsive Design** - Works on all devices
- **User Authentication** - Login/Register with JWT
- **Form Validation** - Client-side validation
- **Beautiful UI** - Modern Bootstrap components
- **Loading States** - User feedback during operations
- **Error Handling** - Graceful error display

## 🎨 Styling

- Bootstrap 5 for responsive design
- Custom CSS for enhanced appearance
- React Icons for consistent iconography
- SweetAlert2 for beautiful notifications

## 🔐 Authentication

- JWT token storage in localStorage
- Automatic token validation
- Protected routes
- Automatic logout on token expiration

## 📱 Pages

1. **Home** - Landing page with app overview
2. **Login** - User authentication
3. **Register** - New user registration
4. **Dashboard** - User profile and actions

## 🚀 Getting Started

1. Make sure your Spring Boot backend is running on port 8080
2. Start the React development server
3. Navigate to `http://localhost:3000`
4. Register a new account or login with existing credentials

## 🔧 Development

- Hot reload enabled
- ESLint for code quality
- React Developer Tools recommended
- Browser console for debugging

## 📝 Notes

- Ensure CORS is properly configured on the backend
- JWT tokens are stored in localStorage
- All API calls include proper error handling
- Responsive design works on mobile and desktop
