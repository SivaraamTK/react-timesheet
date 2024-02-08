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

import SideNavBar from "./SideNavBar";
import "./App.css";

const getPreviousMonday = (date = null) => {
  const prevMonday = (date && new Date(date.valueOf())) || new Date();
  prevMonday.setDate(prevMonday.getDate() - ((prevMonday.getDay() + 6) % 7));
  return prevMonday;
};

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

const projectTypeOptions = [
  { label: "BAU Activity", value: "BAU" },
  { label: "Sales Activity", value: "Sales" },
];
const projectNameOptions = [
  { label: "Training", value: "BAU_001" },
  { label: "People", value: "BAU_002" },
  { label: "Pre-Sales", value: "Sales_001" },
  { label: "Post-Sales", value: "Sales_002" },
];
const taskOptions = [
  { label: "Build & Run Training", value: "Build & Run" },
  { label: "Complete Training", value: "Complete Training" },
  { label: "People Management", value: "People Mgmt." },
  { label: "Pre-Sales Activity", value: "Pre-Sales Act" },
];

function App() {
  const dt = useRef(null);
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

  const [weekStart, setWeekStart] = useState(getPreviousMonday());

  // Load data from local storage whenever the component mounts
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

  useEffect(() => {
    const weekDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const newWeek = weekDays.reduce((acc, day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      acc[day] = `${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}`;
      return acc;
    }, {});
    setWeek(newWeek);
  }, [weekStart]);

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

  const textEditor = (options) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  const numberEditor = (day) => {
    return (props) => (
      <InputNumber
        {...props}
        mode="decimal"
        min={0}
        className={props.value > 8 ? "p-invalid" : ""}
        style={props.value > 8 ? { color: "red" } : {}}
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

  const dynamicRowClassName = (rowData) => {
    if (rowData.hours) {
      return {
        "red-row": Object.values(rowData.hours).some((hour) => hour >= 8),
      };
    } else {
      return {};
    }
  };

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

  const removeRow = (index) => {
    if (index !== 0) {
      const newRows = rows.filter((row, i) => i !== index);
      setRows(newRows);
    }
  };

  const prevWeek = () => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() - 7);
    setWeekStart(date);
  };

  const nextWeek = () => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + 7);
    setWeekStart(date);
  };

  const saveData = () => {
    localStorage.setItem(
      `timesheetData-${formatDate(weekStart)}`,
      JSON.stringify(rows)
    );
    saveTimesheetData();
  };

  const saveTimesheetData = async () => {
    try {
      await axios.post(
        `http://localhost:8080/timesheets/${formatDate(weekStart)}`,
        rows
      );
    } catch (error) {
      console.error("Failed to save timesheet data:", error);
    }
  };

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
        <Column header={`${week.mon}`} />
        <Column header={`${week.tue}`} />
        <Column header={`${week.wed}`} />
        <Column header={`${week.thu}`} />
        <Column header={`${week.fri}`} />
        <Column header={`${week.sat}`} />
        <Column header={`${week.sun}`} />
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
                <div className="date-range">{`${week.mon} to ${week.sun}`}</div>
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
                rowClassName={dynamicRowClassName}
                editMode="cell"
                size="small"
                tableStyle={{
                  minWidth: "50rem",
                }}
              >
                <Column
                  field="projectType"
                  key="projectType"
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
                  editor={(options) => textEditor(options)}
                  onCellEditComplete={onCellEditComplete}
                />
                <Column
                  field="hours.mon"
                  key="hours.mon"
                  editor={numberEditor("mon")}
                />
                <Column
                  field="hours.tue"
                  key="hours.tue"
                  editor={numberEditor("tue")}
                />
                <Column
                  field="hours.wed"
                  key="hours.wed"
                  editor={numberEditor("wed")}
                />
                <Column
                  field="hours.thu"
                  key="hours.thu"
                  editor={numberEditor("thu")}
                />
                <Column
                  field="hours.fri"
                  key="hours.fri"
                  editor={numberEditor("fri")}
                />
                <Column
                  field="hours.sat"
                  key="hours.sat"
                  editor={numberEditor("sat")}
                />
                <Column
                  field="hours.sun"
                  key="hours.sun"
                  editor={numberEditor("sun")}
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
