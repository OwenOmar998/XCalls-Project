# XCalls Project

A Vue 3 application developed using TypeScript and Vite, designed to handle VoIP calls with SIP.js integration. This project features a user-friendly call interface that includes call logging, call summaries, and the ability to handle incoming, ongoing, and completed call statuses.

## Features

- **VoIP Calls**: Enables users to make and receive VoIP calls.
- **Call Summaries**: Displays a summary of each call.
- **Call Logging**: Logs details like call status, duration, and activity.
- **Responsive UI**: Built with Tailwind CSS for a responsive interface.

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/OwenOmar998/XCalls-Project.git
   cd XCalls-Project
   ```
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Create a .env file in the root directory and add the following configurations**:

   ```bash
    VITE_SIP_DOMAIN="***"
    VITE_SIP_PORT="***"
    VITE_SIP_PATH="***"
    VITE_SIP_USERNAME="***"
    VITE_SIP_PASSWORD="***"
   ```

4. **Development Server**:
   ```bash
   pnpm dev
   ```
