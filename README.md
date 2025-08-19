# 🚀 Project Mukesh-Client

A full-stack portfolio/project showcase application built with React, Node.js, Express, and MongoDB.

## 📦 Project Structure

```
project/
├── backend/         # Node.js/Express API & MongoDB
├── public/          # Static assets
├── src/             # React frontend
├── index.html       # Main HTML entry
├── package.json     # Project dependencies & scripts
└── README.md        # This file
```

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript(enough to make this project go live), Tailwind CSS, Vite
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **Auth:** JWT
- **Validation:** Joi, express-validator
- **Logging:** Winston, Morgan
- **Dev Tools:** ESLint, PostCSS, Nodemon

## ⚡ Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/mukeshrawatmkr/mukesh-client.git
cd project-bolt
```

### 2. Install Dependencies

#### Frontend

```sh
npm install
```

#### Backend

```sh
cd backend
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env` in the backend folder and fill in your configuration:

```sh
cp backend/.env.example backend/.env
```

### 4. Running the App

#### Backend

```sh
cd backend
npm run dev
```

#### Frontend

```sh
npm run dev
```

## 🧩 Features

- Project CRUD (Create, Read, Update, Delete)
- Authentication (JWT, Admin-only routes)
- Contact form & message management
- Project statistics dashboard
- Responsive UI with animations
- Logging & error handling

## 📚 API Endpoints

See [backend/README.md](backend/README.md) for full API documentation.

Example:

- `GET /api/projects` — List projects
- `POST /api/projects` — Create project (admin)
- `PUT /api/projects/:id` — Update project (admin)
- `DELETE /api/projects/:id` — Delete project (admin)
- `GET /api/projects/stats` — Project stats (admin)
- `POST /api/contact` — Submit contact form

## 🖼️ Screenshots

_Will add screenshots of my app UI here._

## 📝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## 🙋‍♂️ Support

For issues, open a ticket or contact [swissmukesh@gmail.com](mailto:swissmukeshrawat@gmail.com).
