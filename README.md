# React TypeScript E-commerce Platform

A modern, feature-rich e-commerce platform built with React 19 and TypeScript, offering comprehensive shopping features, user authentication, and an advanced admin dashboard. The application is fully responsive across all devices and professionally styled using Bootstrap 5.

## 🚀 Features

### User Features
- **Authentication**
  - Sign Up/Sign In
  - Password Management (Reset/Forget)
  - User Profile Management
  
- **Shopping Experience**
  - Interactive Home Page with Main Slider
  - Dynamic Category Navigation
  - Special Offers Section
  - Lowest Price Products Showcase
  - Advanced Product Search & Filtering
  
- **Product Management**
  - Detailed Product Views
  - Shopping Cart Functionality
  - Wishlist System 
  - Secure Order Placement
  
### Admin Dashboard
- **Analytics & Management**
  - Performance Summary Cards
  - Interactive Charts (Recharts)
  - Full CRUD Operations for:
    - Products
    - Orders
    - Users
    - Contact Messages
  
### Technical Features
- Responsive Design (Mobile, Tablet, Desktop)
- Dynamic API Integration
- Loading States with Spinners
- Error Handling with Alert System
- Form Validation
- Protected Routes

## 🛠️ Technologies

- **Core**
  - React 19.x
  - TypeScript
  - Vite
  
- **State Management & Data Fetching**
  - Redux Toolkit
  - React Query (Tanstack)
  
- **Styling & UI**
  - Bootstrap 5
  - CSS Modules
  
- **Form Handling**
  - React Hook Form
  - Zod Validation
  
- **Routing & HTTP**
  - React Router DOM
  - Axios
  
- **Visualization**
  - Recharts

## 📁 Project Structure

```
src/
├── app/             # App configuration, store setup
├── components/      # Reusable UI components
│   ├── common/     # Shared components
│   └── product/    # Product-specific components
├── features/        # Feature modules
│   ├── admin/      # Admin dashboard
│   ├── auth/       # Authentication
│   ├── home/       # Home page
│   ├── order/      # Order management
│   └── product/    # Product management
├── routes/         # Application routing
└── styles/         # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm 7.x or higher

### Installation

1. Clone the repository
```bash
git clone https://github.com/haidy47-design/React-ts.git
cd my-app
```

2. Install dependencies
```bash
npm install 
```

3. Create a `.env` file in the root directory with the following variables:
```env
VITE_GROQ_API_KEY=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
```

4. Start development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔗 API Endpoints

- **Users**: `https://68e83849f2707e6128ca32fb.mockapi.io/users`
- **Products**: `https://68e43ee28e116898997b5bf8.mockapi.io/product`
- **Orders**: `https://68e43ee28e116898997b5bf8.mockapi.io/orders`
- Additional endpoints for cart, wishlist, and contacts operations

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📝 Development Notes

- **Responsive Design**: Mobile-first approach using Bootstrap breakpoints
- **Component Reusability**: Modular design with shared components
- **Form Validation**: Comprehensive validation using React Hook Form + Zod
- **State Management**: Efficient state handling with Redux Toolkit
- **API Integration**: Centralized API calls using Axios instances
- **Error Handling**: Global error boundary and per-request error handling

## 🔒 Security

- Protected routes for authenticated users
- Secure admin dashboard access
- Form validation and sanitization
- Token-based authentication

## License

[MIT License](LICENSE)

---
Built with ❤️ using React + TypeScript
