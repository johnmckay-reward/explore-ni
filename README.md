# Discover NI

Welcome to the Discover NI project! This is a full-stack application designed to help users explore Northern Ireland.

It consists of two main parts:
* `/api`: An Express.js server that handles data and backend logic.
* `/ui`: An Angular application that provides the user interface.

This repository is set up as a monorepo using npm workspaces, which makes it easy to install and run everything from the root directory.

## Requirements

* [Node.js](https://nodejs.org/) (LTS version recommended)
* [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

You only need to run one command from the root directory of this project. This command will install all dependencies for the root, the API, and the UI in one go.

```bash
npm install
```

## Running the Application

To start both the backend API and the frontend UI at the same time, just run:

```bash
npm run start
```

### What Happens Next?

This single command will:
1.  **Start the API:** The Express server (from `/api`) will start running.
2.  **Start the UI:** The Angular server (from `/ui`) will start compiling and running.
3.  **Wait & Open:** The script will wait for the Angular app to be ready and then automatically open `http://localhost:4200` in your default web browser.

You'll see the logs from both servers combined in your terminal.

## Development

### Running Services Independently

If you only want to work on one part of the application, you can run the UI or API services individually using npm workspace commands from the root directory:

* **To run only the Angular UI:**
    ```bash
    npm run start -w ui
    ```

* **To run only the Express API:**
    ```bash
    npm run start -w api
    ```
