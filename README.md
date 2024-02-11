# React Timesheet

This is a full-stack web application built with React, Node.js, Express.js, Sequelize ORM and PostgreSQL. It allows users to manage and perform CRUD operations on timesheet data.

## Features

- User-friendly interface for managing timesheet data
- Asynchronous storage and retrieval of data using Sequelize ORM with PostgreSQL database
- Middleware server app built with Express.js to handle requests from the frontend and interact with the database
- Makes use of Node.js workspaces to manage the server and client apps in a single repository while sharing dependencies

## Installation

*Note:*
Make sure you have Node.js and npm installed on your machine.

To run the project, follow these steps:

1. Clone the repository:
```bash
git clone https://github.com/SivaraamTK/react-timesheet.git
```

2. Navigate to the project directory:
```bash
cd react-timesheet
```
3. Install dependencies:
```bash
npm run deps
```
4. Start the server:
```bash
npm run server
```
5. In a new terminal window, start the client app:
```bash
npm run client
```

*Note:*
Since we are using Node.js workspaces, we can separately install dependencies or run scripts for the server and client apps by using the `server` and `client` workspaces with the flag `--workspace=` or `--w=`.
Eg:
```bash
npm install express --workspace=./server
```
or
```bash
npm install axios --ws=./client
```

## Usage

Once the server and client are running, you can access the application by opening your browser and navigating to `http://localhost:3001`.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
