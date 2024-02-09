// useTimesheetData.js
import { useState, useEffect } from "react";
import axios from "axios";
import { formatDate } from "../utility/dateFuncts";

export default function useTimesheetData(weekStart) {
  // State to store the timesheet data
  const [rows, setRows] = useState([
    {
      projectType: "",
      projectName: "",
      task: "",
      comment: "",
      hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      total: 0,
    },
  ]);

  // Load data from local storage or backend whenever the component mounts
  useEffect(() => {
    const fetchTimesheetData = async (date) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/timesheets/${date}`
        );
        setRows(response.data);
        localStorage.setItem(
          `timesheetData-${formatDate(weekStart)}`,
          JSON.stringify(response.data)
        );
      } catch (error) {
        console.error("Failed to fetch timesheet data:", error);
      }
    };
    
    const savedData = localStorage.getItem(
      `timesheetData-${formatDate(weekStart)}`
    );
    if (savedData) {
      let loadedRows = JSON.parse(savedData);
      if (!Array.isArray(loadedRows)) {
        loadedRows = [loadedRows];
      }
      setRows(loadedRows);
      console.log("Loaded data from local storage");
    } else {
      (async () => {
        await fetchTimesheetData(formatDate(weekStart));
      })();
    }
  }, [weekStart]);

  return [rows, setRows];
}
