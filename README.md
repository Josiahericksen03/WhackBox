# WhackBox

A parody version of the popular online game known as "Jack Box," that contains many minigames.

## Initial Setup

To run this program, follow these steps after pulling the project:

### Install Node.js Packages

1. **Initialize npm:**
   ```bash
   npm init -y
   ```

2. **Install Express, EJS, and Socket.io:**
   ```bash
   npm install express ejs socket.io
   ```

3. **Install UUID:**
   ```bash
   npm install uuid
   ```

4. **Install Nodemon for Development:**
   ```bash
   npm install --save-dev nodemon
   ```

### Start the Development Server

1. **Run the Development Server:**
   ```bash
   npm run devStart
   ```

### Install and Run PeerJS

1. **Install PeerJS Globally:**
   ```bash
   npm install -g peer
   ```

2. **Run PeerJS on Port 3001:**
   ```bash
   peerjs --port 3001
   ```

### Note for macOS Users

1. **You might need to enable script execution by running:**
   ```bash
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **For macOS, you can start PeerJS with:**
   ```bash
   npx peerjs --port 3001
   ```
```

