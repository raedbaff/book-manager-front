# 📚 Book Management Dashboard (Frontend)

- This is the frontend for the Full Stack Engineering Test, built with React, GraphQL, and Chakra UI. It allows admins to manage books by creating, editing, and deleting them, while integrating authentication using Auth0.

## 🚀 Features

- 🔐 Authentication & Authorization using Auth0
- 📖 CRUD Operations (Create, Read, Update, Delete) for books
- 🏗 GraphQL API Integration
- 🎨 Chakra UI Components for a responsive and accessible UI

## 🛠️ Tech Stack

- React – Frontend framework
- GraphQL – API communication
- Apollo Client – GraphQL state management
- Chakra UI – UI framework
- TypeScript – Type safety
- Auth0 – Authentication & Authorization

## 📦 Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/raedbaff/book-manager-front.git
cd book-manager-front
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Set up environment variables (Create a .env file)

VITE_GRAPHQL_URL=<your-backend-graphql-url>

- update auth_config.json
```json
{
"domain": "domain",
"clientId": "clientId",
"audience": "audience"
}
```

### 4️⃣ Run the project
```bash
- npm run dev
```

## ⚡ Usage
- Login using Auth0
- View all books in a table
- Create, edit, and delete books
