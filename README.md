# 🐾 Pet Adoption Portal — Frontend

## 📌 About the Project

The Pet Adoption Portal Frontend is the user interface of a web-based pet adoption application. It allows users to explore available pets, view pet details, and interact with adoption features through a simple and user-friendly website.

This frontend is designed to work with the Java Spring Boot backend and MySQL database.

## ✨ Features

- User-friendly website interface
- Browse available pets
- View pet details and images
- User registration and login interface
- Add and manage pet listings
- Submit pet adoption requests
- Responsive and clean styling

## 🛠️ Technologies Used

- HTML
- CSS
- JavaScript
- Node.js
- npm

## 📂 Project Structure

```text
pet-adoption-frontend/
├── images/
│   └── pets/
├── main.js
├── style.css
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following software:

- Node.js
- npm
- Visual Studio Code (recommended)

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/koushalyadav1/pet-adoption-frontend.git
cd pet-adoption-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the frontend

```bash
npm start
```

Open the local URL configured by the project in your browser. If the server uses port 5173, visit:

`http://localhost:5173`

Keep the terminal running while using the website.

## 🔗 Backend Integration

The frontend communicates with the Java Spring Boot backend to support application features such as authentication, pet management, and adoption requests.

When running locally, the backend is expected to be available at:

`http://localhost:8080`

Update the frontend API configuration if the backend runs at a different address. For deployment, use the public backend URL instead of `localhost`.

## 🧪 Testing

Verify that:

1. The frontend starts without errors.
2. Pet details and images display correctly.
3. Registration and login work with the backend.
4. Pet listings can be loaded and managed.
5. Adoption requests work as expected.

## 🌐 Deployment

The frontend can be deployed using a hosting platform such as Vercel or another service that supports your Node.js setup.

Before deployment, configure the correct backend API URL and ensure that the backend allows requests from the deployed frontend.

## 👨‍💻 Author

**Koushal Yadav**

GitHub: https://github.com/koushalyadav1

## 📄 License

This project is intended for educational and demonstration purposes. Add a license file if you plan to distribute it under specific terms.
