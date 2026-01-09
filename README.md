# Grinding Dating App 💘

A Tinder-like dating application built with the MEAN stack (slightly modified: Node.js, Express, Angular, JSON-DB).

## Features
- **Authentication**: User registration and login.
- **Profile Management**: Update your details, bio, and profile picture.
- **Swiping**: Browse profiles with "Like" and "Nope" actions.
- **Matching**: Get matched instantly when the feeling is mutual!
- **Chat**: Real-time messaging with your matches.

## Tech Stack
-   **Frontend**: Angular 19, Bootstrap 5
-   **Backend**: Node.js, Express
-   **Database**: Local JSON file (for simplicity)

## Getting Started

### Prerequisites
-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [Angular CLI](https://angular.io/cli) (installed globally: `npm install -g @angular/cli`)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/karolsowi/dating-app.git
    cd dating-app
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../client
    npm install
    ```

## Running the Application

You need to run both the backend server and the frontend client simultaneously.

### 1. Start the Backend Server
Open a terminal in the `server` directory:
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### 2. Start the Frontend Application
Open a new terminal in the `client` directory:
```bash
npm start
```
The Angular app will start and automatically open `http://localhost:4200` in your browser.

## Project Structure
-   `client/`: Angular application source code.
-   `server/`: Node.js Express API and data storage.
-   `server/data/db.json`: Local database file (stores users, matches, and messages).

## License
MIT
