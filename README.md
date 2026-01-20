# Grinding Dating App 💘

A Tinder-like dating application built with the MEAN stack (modified: Node.js, Express, Angular, JSON-DB).

## Features Status

### ✅ Implemented Features
- **Authentication**: Secure user registration and login.
- **Home Dashboard**: View recent matches and quickstats upon login.
- **Matching System**:
  - browse potential matches.
  - "Like" (Heart) or "Pass" (X) actions.
  - Image slider to view multiple photos of a user.
  - "It's a Match!" modal when interest is mutual.
- **Profile Management**:
  - **Edit Profile**: Single-column layout to update Bio, Profile Picture, and Gallery.
  - **Gallery**: Upload up to 6 photos (image links).
  - **Profile Picture**: Robust handling, defaults to first gallery image if main is missing.
- **Public Profiles**:
  - View full profiles of other users from the Match list or Chat.
  - See "About Me", "Looking For" badges, and Photo Gallery.
  - **Privacy**: Like counts on photos are hidden for visitors (visible only to the owner).
- **Chat**: Basic real-time messaging interface with matched users.
- **Responsive Design**: Mobile-friendly layout with sticky bottom promo bar.

### 🚧 Not Implemented
- **Notifications**: Real-time alerts for new matches or messages are *not yet implemented*.
- **Advanced Settings**:
  - **Subscription**: Placeholder.
  - **General / Blocked Users / Help**: Placeholders. Only "Edit Profile" is fully functional in the Settings menu.

## Tech Stack
-   **Frontend**: Angular 19, Bootstrap 5 (Custom SCSS)
-   **Backend**: Node.js, Express
-   **Database**: Local JSON files (split into `users.json`, `matches.json`, `likes.json`, etc. for scalability).

## Understanding the Data
The application uses a local file-based database located in `server/data/`. Unlike typical setups, data is split into specific files:
- `users.json`: User profiles and authentication data.
- `matches.json`: Established matches between users.
- `likes.json` / `passes.json`: Tracking user actions.
- `messages.json`: Chat history.
*(Note: `db.json` exists as a legacy/backup file).*

## Getting Started

### Prerequisites
-   [Node.js](https://nodejs.org/) (v16 or higher)
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

## License
MIT
