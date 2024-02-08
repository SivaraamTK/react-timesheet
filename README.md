# React-Timesheet

This is a web application built with React that displays a timesheet using the Primereact Datatable component. The data for the timesheet is stored on a server created with ExpressJS.

## Getting Started

To run the React-Timesheet app, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/your-username/react-timesheet.git
```

2. Navigate to the project directory:

```bash
cd react-timesheet
```

3. Install the dependencies:

```bash
npm run deps
```

4. Start the client app:

```bash
npm run client
```

5. Start the server app:

```bash
npm run server
```

## Usage

Once the app is running, you can access client in your browser at `http://localhost:3001`. The timesheet will be displayed using the Primereact Datatable component. You can interact with the timesheet by adding, editing, and deleting entries.

## Server API

The server app provides the following API endpoints:

- `GET /timesheet`: Retrieves the timesheet data.
- `POST /timesheet`: Adds a new entry to the timesheet.
- `PUT /timesheet/:id`: Updates an existing entry in the timesheet.
- `DELETE /timesheet/:id`: Deletes an entry from the timesheet.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
