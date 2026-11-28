# 🧑‍🍳 Heshel

**Heshel** is an engaging culinary social platform where users can create accounts, share recipes, join cooking groups, connect with friends, and manage their personal kitchen collection.

---

![Hero Section](./src/assets/Screenshot%202025-05-24%20144439.png)

---

## ✨ Features

- 🔐 **User Authentication**  
  - Email/password sign-up  
  - Google login

- 📝 **Recipe Management**  
  - Create, edit, delete recipes  
  - View personal recipe collection

- ❤️ **Like Feature**  
  - Like recipes from others  
  - Prevent multiple likes from the same user

- 🔎 **Cuisine Filter**  
  - Filter recipes by cuisine type

- 💻 **Responsive UI**  
  - Fully mobile-friendly  
  - Smooth animations

---

## 🛠️ Technologies Used

### 🔧 Frontend
- **React**
- **React Router**
- **Tailwind CSS**
- **DaisyUI**
- **Framer Motion**
- **Lottie React**
- **React Tooltip**

### 🔐 Authentication
- **Firebase Authentication**
  - Email/Password
  - Google Sign-in

### 🔙 Backend (API)
- Hosted REST API on **Vercell**
  - Built with **Node.js**, **Express**
  - **MongoDB** for database

### 📦 NPM Packages Used

| Package           | Purpose                                            |
|-------------------|----------------------------------------------------|
| `react`           | Core UI library                                    |
| `react-dom`       | DOM rendering                                      |
| `react-router-dom`| SPA routing/navigation                             |
| `tailwindcss`     | Utility-first CSS framework                        |
| `daisyui`         | Tailwind-based UI component library                |
| `framer-motion`   | Animations and transitions                         |
| `lottie-react`    | Animated SVGs using JSON                           |
| `firebase`        | Authentication & deployment                        |
| `classnames`      | Conditional class management *(if used)*           |
| `react-icons`     | Icon library for React                             |
| `react-tooltip`   | Tooltips for UI elements                           |
| `sweetalert2`     | Popup alerts for success/error prompts             |
| `react-helmet`    | Manage HTML `<head>` (meta tags, titles)           |


## 📁 Folder Structure

```bash
src/
├── assets/              # Images, icons, backgrounds
├── components/          # Navbar, Footer, Cards, etc.
├── pages/               # Page components (Home, Recipes, Profile, etc.)
├── authProvider/        # Firebase Auth Context
├── App.jsx
└── main.jsx
