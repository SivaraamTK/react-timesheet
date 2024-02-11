import React, { useRef, useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import "primereact/resources/themes/lara-light-purple/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { getPreviousMonday, formatDate, shortDate } from "./utility/dateFuncts";
import {
  projectTypeOptions,
  projectNameOptions,
  taskOptions,
} from "./placeholders/dropdownOptionSample";
import { cellStyle } from "./utility/dynamicStyles";
import SideNavBar from "./SideNavBar";
import "./App.css";

function App() {
  // Reference to the DataTable component
  const dt = useRef(null);

  // State variable for timesheet data
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

  // State variable for total hours
  const [total, setTotal] = useState({
    mon: 0,
    tue: 0,
    wed: 0,
    thu: 0,
    fri: 0,
    sat: 0,
    sun: 0,
    overall: 0,
  });

  // State variable for the week's dates, current week by default
  const [week, setWeek] = useState({
    mon: getPreviousMonday(),
    tue: new Date(
      getPreviousMonday().setDate(getPreviousMonday().getDate() + 1)
    ),
    wed: new Date(
      getPreviousMonday().setDate(getPreviousMonday().getDate() + 2)
    ),
    thu: new Date(
      getPreviousMonday().setDate(getPreviousMonday().getDate() + 3)
    ),
    fri: new Date(
      getPreviousMonday().setDate(getPreviousMonday().getDate() + 4)
    ),
    sat: new Date(
      getPreviousMonday().setDate(getPreviousMonday().getDate() + 5)
    ),
    sun: new Date(
      getPreviousMonday().setDate(getPreviousMonday().getDate() + 6)
    ),
  });

  // State variable for the week's start date
  const [weekStart, setWeekStart] = useState(getPreviousMonday());

  // Load data from local storage or backend whenever the component mounts
  useEffect(() => {
    const fetchTimesheetData = async (date) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/timesheets/${date}`
        );
        let data = response.data;
        if (!Array.isArray(data)) {
          data = [
            {
              projectType: "",
              projectName: "",
              task: "",
              comment: "",
              hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
              total: 0,
            },
          ];
        }
        setRows(data);
        localStorage.setItem(
          `timesheetData-${formatDate(weekStart)}`,
          JSON.stringify(data)
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
        loadedRows = [
          {
            projectType: "",
            projectName: "",
            task: "",
            comment: "",
            hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
            total: 0,
          },
        ];
      }
      setRows(loadedRows);
      console.log("Loaded data from local storage");
    } else {
      (async () => {
        await fetchTimesheetData(formatDate(weekStart));
      })();
    }
  }, [weekStart]);

  // Update the total hours whenever the timesheet data changes
  useEffect(() => {
    if (!Array.isArray(rows)) {
      console.error("rows is not an array");
      return;
    }
    const newTotal = rows.reduce((acc, row) => {
      if (row && typeof row === "object" && row.hours) {
        Object.keys(row.hours).forEach((day) => {
          acc[day] = (acc[day] || 0) + (row.hours[day] || 0);
        });
      }
      return acc;
    }, {});
    newTotal.overall =
      Object.values(newTotal).reduce((a, b) => {
        const numA = Number(a) || 0;
        const numB = Number(b) || 0;
        return numA + numB;
      }, 0) - (Number(newTotal.overall) || 0);
    setTotal(newTotal);
    console.log("Updated totals");
  }, [rows]);

  // Save the timesheet data to local storage whenever the timesheet data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(
        `timesheetData-${formatDate(weekStart)}`,
        JSON.stringify(rows)
      );
      console.log("Saved data to local storage");
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [rows, weekStart]);

  // Update the week's dates whenever the week's start date changes
  useEffect(() => {
    const weekDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const newWeek = weekDays.reduce((acc, day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      acc[day] = new Date(date);
      return acc;
    }, {});
    setWeek(newWeek);
  }, [weekStart]);

  // Update the edited cell's value in the state
  const onCellEditComplete = (e) => {
    let { rowData, newValue, field, originalEvent: event } = e;
    if (newValue.trim().length > 0) {
      const index = rows.findIndex((row) => row === rowData);
      const newRows = [...rows];
      newRows[index][field] = newValue;
      setRows(newRows);
    } else {
      event.preventDefault();
    }
  };

  // Custom editor for text input
  const textEditor = (options) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  // Custom editor for number input
  const numberEditor = (day) => {
    return (props) => (
      <InputNumber
        {...props}
        mode="decimal"
        min={0}
        className={props.value >= 8 ? "p-invalid" : ""}
        style={props.value >= 8 ? { color: "red" } : {}}
        onChange={(e) => {
          const newRows = [...rows];
          newRows[props.rowIndex].hours = newRows[props.rowIndex].hours || {};
          newRows[props.rowIndex].hours[day] = e.value || 0;
          newRows[props.rowIndex].total = Object.values(
            newRows[props.rowIndex].hours
          ).reduce((a, b) => a + b, 0);
          setRows(newRows);
          const newTotal = { ...total };
          newTotal[day] = newRows.reduce(
            (sum, row) => sum + ((row.hours && row.hours[day]) || 0),
            0
          );
          newTotal.overall =
            Object.values(newTotal).reduce((a, b) => a + b, 0) -
            newTotal.overall;
          setTotal(newTotal);
        }}
      />
    );
  };

  // Custom editor for dropdown input
  const DropdownEditor = ({ options, fieldOptions, rows, setRows }) => {
    const [dropdownValue, setDropdownValue] = useState(
      options.rowData[options.field]
    );

    return (
      <Dropdown
        editable
        filter
        showClear
        value={dropdownValue}
        options={fieldOptions}
        onChange={(e) => {
          setDropdownValue(e.value);
          let editedRows = [...rows];
          let newRow = { ...editedRows[options.rowIndex] };
          newRow[options.field] = e.value;
          editedRows[options.rowIndex] = newRow;
          setRows(editedRows);
        }}
        placeholder="Select a value"
        className="w-full md:w-14rem"
        style={{ width: "100%" }}
      />
    );
  };

  // Add a new row to the timesheet
  const addRow = () => {
    setRows([
      ...rows,
      {
        projectType: "",
        projectName: "",
        task: "",
        comment: "",
        hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
        total: 0,
      },
    ]);
  };

  // Remove a row from the timesheet
  const removeRow = (index) => {
    if (index !== 0) {
      const newRows = rows.filter((row, i) => i !== index);
      setRows(newRows);
    }
  };

  // Move to the previous week
  const prevWeek = () => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() - 7);
    setWeekStart(date);
  };

  // Move to the next week
  const nextWeek = () => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + 7);
    setWeekStart(date);
  };

  // Save the timesheet data to local storage and the server
  const saveData = () => {
    localStorage.setItem(
      `timesheetData-${formatDate(weekStart)}`,
      JSON.stringify(rows)
    );
    saveTimesheetData();
  };

  // Save the timesheet data to the server
  const saveTimesheetData = async () => {
    try {
      console.log("Saving timesheet data in server...");
      await axios.post(
        `http://localhost:8080/timesheets/${formatDate(weekStart)}`,
        rows
      );
      console.log("Timesheet data saved successfully!");
    } catch (error) {
      console.error("Failed to save timesheet data:", error);
    }
  };

  // Export the timesheet data to a CSV file
  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const headerGroup = (
    <ColumnGroup className="p-datatable-header ">
      <Row>
        <Column header="Project Type" rowSpan={3} />
        <Column header="Project Name" rowSpan={3} />
        <Column header="Task" rowSpan={3} />
        <Column header="Comment" rowSpan={3} />
        <Column header="" colSpan={7} />
        <Column header="Total" rowSpan={3} />
      </Row>
      <Row>
        <Column header="Mon" />
        <Column header="Tue" />
        <Column header="Wed" />
        <Column header="Thu" />
        <Column header="Fri" />
        <Column header="Sat" />
        <Column header="Sun" />
      </Row>
      <Row>
        <Column header={shortDate(week.mon)} />
        <Column header={shortDate(week.tue)} />
        <Column header={shortDate(week.wed)} />
        <Column header={shortDate(week.thu)} />
        <Column header={shortDate(week.fri)} />
        <Column header={shortDate(week.sat)} />
        <Column header={shortDate(week.sun)} />
      </Row>
    </ColumnGroup>
  );

  const footerGroup = (
    <ColumnGroup className="p-datatable-footer">
      <Row>
        <Column
          footer="Totals:"
          colSpan={4}
          footerStyle={{ textAlign: "right" }}
          className="p-datatable-tfoot p-column-title"
        />
        <Column className="p-datatable-tfoot" footer={total.mon} />
        <Column className="p-datatable-tfoot" footer={total.tue} />
        <Column className="p-datatable-tfoot" footer={total.wed} />
        <Column className="p-datatable-tfoot" footer={total.thu} />
        <Column className="p-datatable-tfoot" footer={total.fri} />
        <Column className="p-datatable-tfoot" footer={total.sat} />
        <Column className="p-datatable-tfoot" footer={total.sun} />
        <Column className="p-datatable-tfoot" footer={total.overall} />
      </Row>
    </ColumnGroup>
  );

  return (
    <div className="wrapper">
      <div className="container">
        <div id="sidebar">
          <SideNavBar />
        </div>
        <div className="p-datatable-wrapper">
          <div className="header-section">
            <div id="datepicker">
              <div className="d-flex">
                <button
                  type="button"
                  onClick={prevWeek}
                  className="p-button p-component p-button-icon-only"
                >
                  <span className="p-button-icon p-c pi pi-angle-left"></span>
                  <span className="p-button-label p-c">&nbsp;</span>
                </button>
                <div className="date-range">{`${formatDate(
                  week.mon
                )} to ${formatDate(week.sun)}`}</div>
                <button
                  type="button"
                  onClick={nextWeek}
                  className="p-button p-component p-button-icon-only"
                >
                  <span className="p-button-icon p-c pi pi-angle-right"></span>
                  <span className="p-button-label p-c">&nbsp;</span>
                </button>
              </div>
            </div>
            <br />
            <br />
            <h1
              className="table-name"
              style={{
                textAlign: "left",
                paddingLeft: "1rem",
              }}
            >
              Timesheet
            </h1>
          </div>

          <div className="p-datatable card p-fluid">
            {Array.isArray(rows) ? (
              <DataTable
                value={rows}
                ref={dt}
                headerColumnGroup={headerGroup}
                footerColumnGroup={footerGroup}
                editMode="cell"
                tableStyle={{
                  minWidth: "50rem",
                }}
              >
                <Column
                  field="projectType"
                  key="projectType"
                  body={(rowData) => (
                    <div style={cellStyle}>{rowData.projectType}</div>
                  )}
                  editor={(props) => (
                    <DropdownEditor
                      options={props}
                      fieldOptions={projectTypeOptions}
                      rows={rows}
                      setRows={setRows}
                    />
                  )}
                />
                <Column
                  field="projectName"
                  key="projectName"
                  body={(rowData) => (
                    <div style={cellStyle}>{rowData.projectName}</div>
                  )}
                  editor={(props) => (
                    <DropdownEditor
                      options={props}
                      fieldOptions={projectNameOptions}
                      rows={rows}
                      setRows={setRows}
                    />
                  )}
                />
                <Column
                  field="task"
                  key="task"
                  body={(rowData) => (
                    <div style={cellStyle}>{rowData.task}</div>
                  )}
                  editor={(props) => (
                    <DropdownEditor
                      options={props}
                      fieldOptions={taskOptions}
                      rows={rows}
                      setRows={setRows}
                    />
                  )}
                />
                <Column
                  field="comment"
                  key="comment"
                  body={(rowData) => (
                    <div style={cellStyle}>{rowData.comment}</div>
                  )}
                  editor={(options) => textEditor(options)}
                  onCellEditComplete={onCellEditComplete}
                />
                <Column
                  field="hours.mon"
                  key="hours.mon"
                  editor={numberEditor("mon")}
                  body={(rowData) => (
                    <div
                      style={
                        rowData.hours.mon >= 8
                          ? { ...cellStyle, color: "red" }
                          : cellStyle
                      }
                    >
                      {rowData.hours.mon}
                    </div>
                  )}
                />
                <Column
                  field="hours.tue"
                  key="hours.tue"
                  editor={numberEditor("tue")}
                  body={(rowData) => (
                    <div
                      style={
                        rowData.hours.tue >= 8
                          ? { ...cellStyle, color: "red" }
                          : cellStyle
                      }
                    >
                      {rowData.hours.tue}
                    </div>
                  )}
                />
                <Column
                  field="hours.wed"
                  key="hours.wed"
                  editor={numberEditor("wed")}
                  body={(rowData) => (
                    <div
                      style={
                        rowData.hours.wed >= 8
                          ? { ...cellStyle, color: "red" }
                          : cellStyle
                      }
                    >
                      {rowData.hours.wed}
                    </div>
                  )}
                />
                <Column
                  field="hours.thu"
                  key="hours.thu"
                  editor={numberEditor("thu")}
                  body={(rowData) => (
                    <div
                      style={
                        rowData.hours.thu >= 8
                          ? { ...cellStyle, color: "red" }
                          : cellStyle
                      }
                    >
                      {rowData.hours.thu}
                    </div>
                  )}
                />
                <Column
                  field="hours.fri"
                  key="hours.fri"
                  editor={numberEditor("fri")}
                  body={(rowData) => (
                    <div
                      style={
                        rowData.hours.fri >= 8
                          ? { ...cellStyle, color: "red" }
                          : cellStyle
                      }
                    >
                      {rowData.hours.fri}
                    </div>
                  )}
                />
                <Column
                  field="hours.sat"
                  key="hours.sat"
                  editor={numberEditor("")}
                  body={(rowData) => (
                    <div
                      style={
                        rowData.hours.sat >= 8
                          ? { ...cellStyle, color: "red" }
                          : cellStyle
                      }
                    >
                      {rowData.hours.sat}
                    </div>
                  )}
                />
                <Column
                  field="hours.sun"
                  key="hours.sun"
                  editor={numberEditor("sun")}
                  body={(rowData) => (
                    <div
                      style={
                        rowData.hours.sun >= 8
                          ? { ...cellStyle, color: "red" }
                          : cellStyle
                      }
                    >
                      {rowData.hours.sun}
                    </div>
                  )}
                />
                <Column
                  field="total"
                  key="total"
                  style={{ fontWeight: "bold" }}
                  editor={false}
                />
                <Column
                  body={(rowData, column) => (
                    <Button label="+" onClick={addRow} />
                  )}
                  style={{ border: "0px solid white" }}
                />
                <Column
                  style={{ border: "0px solid white" }}
                  body={(rowData, column) =>
                    rows.indexOf(rowData) !== 0 ? (
                      <Button
                        label="-"
                        onClick={() => removeRow(rows.indexOf(rowData))}
                      />
                    ) : null
                  }
                />
              </DataTable>
            ) : (
              <div className="loading">Loading...</div>
            )}
          </div>
          <div className="p-button-group">
            <Button
              type="button"
              label="Save"
              icon="pi pi-save"
              className="p-button-help"
              onClick={saveData}
            />
            <Button
              type="button"
              label="Export"
              icon="pi pi-upload"
              className="p-button-help"
              onClick={exportCSV}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
