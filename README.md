<h1 align="center">Invoice-Software-MERN</h1>

## 🎯 About

A full-stack web application built to manage clients, create and track invoices, record payments, and generate PDFs. This project leverages the MERN stack (MongoDB, Express, React, Node.js) to deliver a robust business solution for invoicing and customer management.

## :rocket: Technologies

**Frontend:**
- [React](https://reactjs.org/) (v17)
- [React Router](https://reactrouter.com/) (v5)
- [Redux](https://redux.js.org/) & Redux Thunk for state management
- [Material UI](https://v4.mui.com/) & [Ant Design](https://ant.design/) for UI components
- `@react-pdf/renderer`, `jspdf`, `html2canvas` for PDF generation

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- JWT (JSON Web Tokens) for authentication

**Database:**
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/) for ODM

## :sparkles: Features

- **Authentication**: Secure JWT-based Sign Up and Sign In.
- **Client Management**: Add and track customers.
- **Invoice Tracking**: Create, view, update, and manage invoices with automatic due calculations.
- **Payment Processing**: Record partial or full payments via Cash or bKash.
- **PDF Generation**: Generate and download professional invoice PDFs.
- **Dashboard**: Track overall metrics and summaries.

## 🛠 Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/haid3r-ish/InvoiceErp.git
   cd InvoiceErp
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   # Create a .env file with your MONGO_URI and JWT_SECRET based on .env.sample
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd client
   npm install
   npm start
   ```

## 🧪 Testing Scope (QA)

The application has a mapped QA surface area designed for End-to-End automation testing via Playwright:
- Core E2E Invoice Lifecycle (Client -> Invoice -> Payment)
- Mathematical parity testing for Mongoose pre-save hooks vs UI calculations
- PDF export validation
- Data integrity for orphaned records
