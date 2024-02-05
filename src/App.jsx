import React, { useRef, useState, useEffect } from "react";
import { PrimeReactProvider } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
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

function App() {
  const value = {
    inputStyle: "outlined",
    ripple: true,
    locale: "en",
  };

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

  // Load data from local storage whenever the component mounts
  useEffect(() => {
    const savedData = localStorage.getItem("timesheetData");
    if (savedData) {
      const loadedRows = JSON.parse(savedData);
      setRows(loadedRows);
      console.log("Loaded data from local storage");
    }
  }, []);

  // Calculate total whenever rows changes
  useEffect(() => {
    const newTotal = rows.reduce(
      (acc, row) => {
        Object.keys(row.hours).forEach((day) => {
          acc[day] = (acc[day] || 0) + (row.hours[day] || 0);
        });
        return acc;
      },
      { overall: 0 }
    );
    newTotal.overall =
      Object.values(newTotal).reduce((a, b) => a + b, 0) - newTotal.overall;
    setTotal(newTotal);
    console.log("Updated totals");
  }, [rows]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("timesheetData", JSON.stringify(rows));
      console.log("Saved data to local storage");
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [rows]);

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

  const [weekStart, setWeekStart] = useState(getPreviousMonday);

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
        className={props.value > 6 ? "p-invalid" : ""}
        style={props.value > 6 ? { color: "red" } : {}}
        onChange={(e) => {
          const newRows = [...rows];
          newRows[props.rowIndex].hours[day] = e.value || 0;
          newRows[props.rowIndex].total = Object.values(
            newRows[props.rowIndex].hours
          ).reduce((a, b) => a + b, 0);
          setRows(newRows);
          const newTotal = { ...total };
          newTotal[day] = newRows.reduce(
            (sum, row) => sum + (row.hours[day] || 0),
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

  const dynamicRowClassName = (rowData) => {
    return {
      "red-row": Object.values(rowData.hours).some((hour) => hour > 6),
    };
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
    localStorage.setItem("timesheetData", JSON.stringify(rows));
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
    <PrimeReactProvider value={value}>
      <div className="wrapper">
        <div className="container">
          <div id="sidebar">
            <SideNavBar />
          </div>
          <div className="p-datatable-wrapper">
            <div className="header-section">
              <div id="datepicker">
                <div class="d-flex">
                  <button
                    type="button"
                    onClick={prevWeek}
                    class="p-button p-component p-button-icon-only"
                  >
                    <span class="p-button-icon p-c pi pi-angle-left"></span>
                    <span class="p-button-label p-c">&nbsp;</span>
                  </button>
                  <div class="date-range">{`${week.mon} to ${week.sun}`}</div>
                  <button
                    type="button"
                    onClick={prevWeek}
                    class="p-button p-component p-button-icon-only"
                  >
                    <span class="p-button-icon p-c pi pi-angle-right"></span>
                    <span class="p-button-label p-c">&nbsp;</span>
                  </button>
                </div>
              </div>
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
                  width: "100%",
                }}
              >
                <Column
                  field="projectType"
                  key="projectType"
                  editor={(options) => textEditor(options)}
                  onCellEditComplete={onCellEditComplete}
                />
                <Column
                  field="projectName"
                  key="projectName"
                  editor={(options) => textEditor(options)}
                  onCellEditComplete={onCellEditComplete}
                />
                <Column
                  field="task"
                  key="task"
                  editor={(options) => textEditor(options)}
                  onCellEditComplete={onCellEditComplete}
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
    </PrimeReactProvider>
  );
}

export default App;
