# Maison-Du-Cafe

A full-stack web application for managing a coffee shop's products and orders, built with Node.js/Express backend and a Single Page Application (SPA) frontend.

## Features
- **Database**: 4 connected tables (Users, Products, Orders, OrderItems) with many-to-many relationship
- **Column Types**: Multiple types including INT, VARCHAR, TEXT, DECIMAL, ENUM, TIMESTAMP
- **CRUD Operations**: Full Create, Read, Update, Delete for all entities
- **List Views**: Paginated lists showing important columns
- **Detail Views**: Complete information including related records
- **Validation**: Both client-side and server-side validation
- **Authentication**: User registration and login with JWT tokens
- **Role-based Access**: Different functionalities for logged-in users vs guests
- **Pagination**: All list views support pagination
- **Single Page Application**: Built as SPA with client-side routing
- **Multiple User Roles**: Guest, Customer, Manager, Admin (4 roles)
- **Resource-level Permissions**: Customers can only view their own orders; managers/admins can view all
- **Internationalization**: Support for English and Polish languages

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for server-side validation

### Frontend
- **Vanilla JavaScript** (no frameworks)
- **SPA** with hash-based routing
- **i18n** support (English/Polish)
- **Responsive CSS** design

## Database Schema

### Tables

1. **users**
   - id (INT, PRIMARY KEY)
   - email (VARCHAR, UNIQUE)
   - password_hash (VARCHAR)
   - role (ENUM: guest, customer, manager, admin)
   - name (VARCHAR)
   - created_at (TIMESTAMP)

2. **products**
   - id (INT, PRIMARY KEY)
   - name (VARCHAR)
   - description (TEXT)
   - price (DECIMAL)
   - category (VARCHAR)
   - stock_quantity (INT)
   - created_at (TIMESTAMP)

3. **orders**
   - id (INT, PRIMARY KEY)
   - user_id (INT, FOREIGN KEY → users.id)
   - status (ENUM: pending, processing, completed, cancelled)
   - total_amount (DECIMAL)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

4. **order_items** (Many-to-many with additional columns)
   - id (INT, PRIMARY KEY)
   - order_id (INT, FOREIGN KEY → orders.id)
   - product_id (INT, FOREIGN KEY → products.id)
   - quantity (INT)
   - unit_price (DECIMAL)
   - subtotal (DECIMAL)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher, or MariaDB 10.2+)
- npm or yarn

### Step 1: Clone and Install Dependencies

```bash
cd CoffeeShop
npm install
```

### Step 2: Database Configuration

1. Create a MySQL database:
```sql
CREATE DATABASE coffeeshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Update database connection in `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=coffeeshop
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
```

### Step 3: Initialize Database

Run the database creation script:
```bash
mysql -u root -p < database/schema.sql
```

### Step 4: Load Sample Data

Run the sample data script:
```bash
mysql -u root -p < database/sample_data.sql
```

**Note**: The sample data includes users with password `password123`. All sample users use the same password hash for convenience.

### Step 5: Generate Password Hashes (Optional)

If you want to generate new password hashes for the sample data:
```bash
node scripts/generate_password_hash.js your_password
```

Copy the generated hash and update `database/sample_data.sql` if needed.

### Step 6: Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## Usage

### Accessing the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### Sample User Accounts

The application comes with pre-configured user accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@coffeeshop.com | password123 | Admin |
| manager@coffeeshop.com | password123 | Manager |
| customer1@example.com | password123 | Customer |
| customer2@example.com | password123 | Customer |

### User Roles and Permissions

#### Guest (Not Logged In)
- View products list
- View product details
- Cannot access orders
- Cannot modify data

#### Customer
- All guest permissions
- Create orders
- View own orders only
- View own order details
- Cannot modify products
- Cannot modify other users' orders

#### Manager
- All customer permissions
- Create, update, delete products
- View all orders
- Update order status
- Cannot delete orders

#### Admin
- All manager permissions
- Delete orders
- Full system access

### Features by Role

**Products Management:**
- Guests/Customers: View only
- Managers/Admins: Full CRUD

**Orders Management:**
- Customers: Create orders, view own orders
- Managers: View all orders, update status
- Admins: View all orders, update status, delete orders

**Resource-level Permissions:**
- Customers can only see their own orders in the orders list
- Managers and Admins can see all orders
- Order detail view respects these permissions

### Internationalization

The application supports two languages:
- **English (EN)**: Default language
- **Polish (PL)**: Full translation available

Switch languages using the language selector in the navigation bar. Language preference is saved in localStorage.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Products
- `GET /api/products` - List products (paginated, public)
- `GET /api/products/:id` - Get product details (public)
- `POST /api/products` - Create product (manager/admin only)
- `PUT /api/products/:id` - Update product (manager/admin only)
- `DELETE /api/products/:id` - Delete product (manager/admin only)

### Orders
- `GET /api/orders` - List orders (authenticated, filtered by role)
- `GET /api/orders/:id` - Get order details (authenticated, resource-level permission)
- `POST /api/orders` - Create order (authenticated)
- `PUT /api/orders/:id` - Update order status (manager/admin, resource-level permission)
- `DELETE /api/orders/:id` - Delete order (admin only, resource-level permission)

## Project Structure

```
CoffeeShop/
├── config/
│   ├── database.js          # MySQL connection pool
│   └── auth.js              # JWT configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── productController.js # Product CRUD operations
│   └── orderController.js   # Order CRUD operations
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   ├── resourcePermissions.js # Resource-level permission checks
│   └── validation.js        # Request validation rules
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── productRoutes.js     # Product routes
│   └── orderRoutes.js       # Order routes
├── database/
│   ├── schema.sql           # Database schema
│   └── sample_data.sql      # Sample data
├── public/
│   ├── index.html           # SPA entry point
│   ├── styles.css           # Application styles
│   └── js/
│       ├── app.js           # Main application file
│       ├── router.js       # SPA router
│       ├── api.js          # API client
│       ├── auth.js         # Authentication management
│       ├── i18n.js         # Internationalization
│       └── components/
│           ├── products.js # Products component
│           ├── orders.js   # Orders component
│           └── auth.js     # Auth components
├── scripts/
│   └── generate_password_hash.js # Password hash generator
├── server.js                # Express server
├── package.json             # Dependencies
├── .env.example             # Environment variables template
└── README.md               # This file
```

## Validation

### Client-side Validation
- Email format validation
- Password minimum length (6 characters)
- Required field checks
- Numeric value validation
- Form submission validation

### Server-side Validation
- Express-validator middleware
- Email format validation
- Password strength requirements
- Product data validation (price, stock, etc.)
- Order item validation
- Database constraint checks

## Pagination

All list views support pagination:
- Products list: 10 items per page
- Orders list: 10 items per page
- Pagination controls with Previous/Next buttons
- Page number display

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Role-based access control (RBAC)
- Resource-level permissions
- SQL injection protection (parameterized queries)
- CORS configuration
- Input validation and sanitization

## Development Notes

- The application uses hash-based routing (`#/route`) for SPA functionality
- All API requests include JWT token in Authorization header
- Language preference is stored in localStorage
- Authentication state is managed client-side
- The frontend is built without any frameworks for simplicity

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check `.env` file has correct credentials
- Ensure database `coffeeshop` exists

### Authentication Issues
- Clear browser localStorage if tokens are corrupted
- Verify JWT_SECRET in `.env` matches server configuration
- Check that password hashes in sample data are valid bcrypt hashes

### Port Already in Use
- Change PORT in `.env` file
- Or stop the process using port 3000

## License

This project is created for educational purposes as part of a university assignment.

## Author

Created for PJATK TIN course assignment.
Roman Klimovich s27619@pjwstk.edu.pl


