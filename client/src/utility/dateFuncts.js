// Get the previous Monday's date for the given date, or the date of Monday of the current week if no date is provided
const getPreviousMonday = (date = null) => {
  const prevMonday = (date && new Date(date.valueOf())) || new Date();
  prevMonday.setDate(prevMonday.getDate() - ((prevMonday.getDay() + 6) % 7));
  return prevMonday;
};

// Function to display date in Date object as "YYYY-MM-DD" format
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Function to display date in Date object as "DD-MM" format
function shortDate(date) {
  return date.toISOString().split("T")[0].slice(5);
}

export { getPreviousMonday, formatDate, shortDate };