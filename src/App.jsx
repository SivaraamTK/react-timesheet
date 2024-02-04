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

function App() {
  const value = {
    inputStyle: "outlined",
    ripple: true,
    locale: "en",
  };

  const exampleData = [
    {
      projectType: "A",
      projectName: "Project 1",
      task: "Data Entry",
      comment: "",
      hours: { mon: 3, tue: 5, wed: 6, thu: 4, fri: 5, sat: 0, sun: 0 },
      total: 23,
    },
    {
      projectType: "B",
      projectName: "Project 2",
      task: "Data Sorting",
      comment: "Sorted data based on the date",
      hours: { mon: 0, tue: 2, wed: 1, thu: 0, fri: 2, sat: 1, sun: 5 },
      total: 11,
    },
    {
      projectType: "A",
      projectName: "Project 3",
      task: "Data Visualization",
      comment: "Visualized data using charts and graphs",
      hours: { mon: 3, tue: 0, wed: 0, thu: 3, fri: 0, sat: 5, sun: 2 },
      total: 13,
    },
  ];

  const dt = useRef(null);
  const [rows, setRows] = useState(exampleData);
  const [week, setWeek] = useState({
    mon: "02-05",
    tue: "02-06",
    wed: "02-07",
    thu: "02-08",
    fri: "02-09",
    sat: "02-10",
    sun: "02-11",
  });
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

  useEffect(() => {
    const savedData = localStorage.getItem("timesheetData");
    if (savedData) {
      setRows(JSON.parse(savedData));
    }

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
  }, [rows]);

  const onEditorValueChange = (props, value) => {
    const newRows = [...rows];
    newRows[props.rowIndex][props.field] = value;
    setRows(newRows);
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

  const saveData = () => {
    localStorage.setItem("timesheetData", JSON.stringify(rows));
  };

  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const headerGroup = (
    <ColumnGroup className="p-datatable-header ">
      <Row>
        <Column
          header="Project Type"
          rowSpan={3}
          className="p-column-title p-datatable-thead"
        />
        <Column
          header="Project Name"
          rowSpan={3}
          className="p-column-title p-datatable-thead"
        />
        <Column
          header="Task"
          rowSpan={3}
          className="p-column-title p-datatable-thead"
        />
        <Column
          header="Comment"
          rowSpan={3}
          className="p-column-title p-datatable-thead"
        />
        <Column
          header="No of Hours"
          colSpan={7}
          className="p-column-title p-datatable-thead"
          headerStyle={{
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
        <Column
          header="Total"
          rowSpan={3}
          className="p-column-title p-datatable-thead"
        />
      </Row>
      <Row>
        <Column header="Mon" className="p-column-title p-datatable-thead" />
        <Column header="Tue" className="p-column-title p-datatable-thead" />
        <Column header="Wed" className="p-column-title p-datatable-thead" />
        <Column header="Thu" className="p-column-title p-datatable-thead" />
        <Column header="Fri" className="p-column-title p-datatable-thead" />
        <Column header="Sat" className="p-column-title p-datatable-thead" />
        <Column header="Sun" className="p-column-title p-datatable-thead" />
      </Row>
      <Row>
        <Column
          header={`${week.mon}`}
          className="p-column-title p-datatable-thead"
        />
        <Column
          header={`${week.tue}`}
          className="p-column-title p-datatable-thead"
        />
        <Column
          header={`${week.wed}`}
          className="p-column-title p-datatable-thead"
        />
        <Column
          header={`${week.thu}`}
          className="p-column-title p-datatable-thead"
        />
        <Column
          header={`${week.fri}`}
          className="p-column-title p-datatable-thead"
        />
        <Column
          header={`${week.sat}`}
          className="p-column-title p-datatable-thead"
        />
        <Column
          header={`${week.sun}`}
          className="p-column-title p-datatable-thead"
        />
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
            <h1
              className="table-name"
              style={{
                textAlign: "center",
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Timesheet
            </h1>
            <div className="p-datatable">
              <DataTable
                showGridlines
                value={rows}
                ref={dt}
                headerColumnGroup={headerGroup}
                footerColumnGroup={footerGroup}
                dataKey="projectName"
                editMode="cell"
                onEdit={(e) => onEditorValueChange(e, e.value)}
                tableStyle={{ minWidth: "50rem" }}
              >
                <Column
                  field="projectType"
                  editor={(props) => (
                    <InputText
                      {...props}
                      onChange={(e) =>
                        onEditorValueChange(props, e.target.value)
                      }
                    />
                  )}
                />
                <Column
                  field="projectName"
                  editor={(props) => (
                    <InputText
                      {...props}
                      onChange={(e) =>
                        onEditorValueChange(props, e.target.value)
                      }
                    />
                  )}
                />
                <Column
                  field="task"
                  editor={(props) => (
                    <InputText
                      {...props}
                      onChange={(e) =>
                        onEditorValueChange(props, e.target.value)
                      }
                    />
                  )}
                />
                <Column
                  field="comment"
                  editor={(props) => (
                    <InputText
                      {...props}
                      onChange={(e) =>
                        onEditorValueChange(props, e.target.value)
                      }
                    />
                  )}
                />
                <Column
                  field="hours.mon"
                  editor={(props) => (
                    <InputNumber
                      {...props}
                      onChange={(e) => {
                        const newRows = [...rows];
                        newRows[props.rowIndex].hours.mon = e.value || 0;
                        newRows[props.rowIndex].total = Object.values(
                          newRows[props.rowIndex].hours
                        ).reduce((a, b) => a + b, 0);
                        setRows(newRows);
                        const newTotal = { ...total };
                        newTotal.mon = newRows.reduce(
                          (sum, row) => sum + (row.hours.mon || 0),
                          0
                        );
                        newTotal.overall =
                          Object.values(newTotal).reduce((a, b) => a + b, 0) -
                          newTotal.overall;
                        setTotal(newTotal);
                      }}
                    />
                  )}
                />
                <Column
                  field="hours.tue"
                  editor={(props) => (
                    <InputNumber
                      {...props}
                      onChange={(e) => {
                        const newRows = [...rows];
                        newRows[props.rowIndex].hours.tue = e.value || 0;
                        newRows[props.rowIndex].total = Object.values(
                          newRows[props.rowIndex].hours
                        ).reduce((a, b) => a + b, 0);
                        setRows(newRows);
                        const newTotal = { ...total };
                        newTotal.tue = newRows.reduce(
                          (sum, row) => sum + (row.hours.tue || 0),
                          0
                        );
                        newTotal.overall =
                          Object.values(newTotal).reduce((a, b) => a + b, 0) -
                          newTotal.overall;
                        setTotal(newTotal);
                      }}
                    />
                  )}
                />
                <Column
                  field="hours.wed"
                  editor={(props) => (
                    <InputNumber
                      {...props}
                      onChange={(e) => {
                        const newRows = [...rows];
                        newRows[props.rowIndex].hours.wed = e.value || 0;
                        newRows[props.rowIndex].total = Object.values(
                          newRows[props.rowIndex].hours
                        ).reduce((a, b) => a + b, 0);
                        setRows(newRows);
                        const newTotal = { ...total };
                        newTotal.wed = newRows.reduce(
                          (sum, row) => sum + (row.hours.wed || 0),
                          0
                        );
                        newTotal.overall =
                          Object.values(newTotal).reduce((a, b) => a + b, 0) -
                          newTotal.overall;
                        setTotal(newTotal);
                      }}
                    />
                  )}
                />
                <Column
                  field="hours.thu"
                  editor={(props) => (
                    <InputNumber
                      {...props}
                      onChange={(e) => {
                        const newRows = [...rows];
                        newRows[props.rowIndex].hours.thu = e.value || 0;
                        newRows[props.rowIndex].total = Object.values(
                          newRows[props.rowIndex].hours
                        ).reduce((a, b) => a + b, 0);
                        setRows(newRows);
                        const newTotal = { ...total };
                        newTotal.thu = newRows.reduce(
                          (sum, row) => sum + (row.hours.thu || 0),
                          0
                        );
                        newTotal.overall =
                          Object.values(newTotal).reduce((a, b) => a + b, 0) -
                          newTotal.overall;
                        setTotal(newTotal);
                      }}
                    />
                  )}
                />
                <Column
                  field="hours.fri"
                  editor={(props) => (
                    <InputNumber
                      {...props}
                      onChange={(e) => {
                        const newRows = [...rows];
                        newRows[props.rowIndex].hours.fri = e.value || 0;
                        newRows[props.rowIndex].total = Object.values(
                          newRows[props.rowIndex].hours
                        ).reduce((a, b) => a + b, 0);
                        setRows(newRows);
                        const newTotal = { ...total };
                        newTotal.fri = newRows.reduce(
                          (sum, row) => sum + (row.hours.fri || 0),
                          0
                        );
                        newTotal.overall =
                          Object.values(newTotal).reduce((a, b) => a + b, 0) -
                          newTotal.overall;
                        setTotal(newTotal);
                      }}
                    />
                  )}
                />
                <Column
                  field="hours.sat"
                  editor={(props) => (
                    <InputNumber
                      {...props}
                      onChange={(e) => {
                        const newRows = [...rows];
                        newRows[props.rowIndex].hours.sat = e.value || 0;
                        newRows[props.rowIndex].total = Object.values(
                          newRows[props.rowIndex].hours
                        ).reduce((a, b) => a + b, 0);
                        setRows(newRows);
                        const newTotal = { ...total };
                        newTotal.sat = newRows.reduce(
                          (sum, row) => sum + (row.hours.sat || 0),
                          0
                        );
                        newTotal.overall =
                          Object.values(newTotal).reduce((a, b) => a + b, 0) -
                          newTotal.overall;
                        setTotal(newTotal);
                      }}
                    />
                  )}
                />
                <Column
                  field="hours.sun"
                  editor={(props) => (
                    <InputNumber
                      {...props}
                      onChange={(e) => {
                        const newRows = [...rows];
                        newRows[props.rowIndex].hours.sun = e.value || 0;
                        newRows[props.rowIndex].total = Object.values(
                          newRows[props.rowIndex].hours
                        ).reduce((a, b) => a + b, 0);
                        setRows(newRows);
                        const newTotal = { ...total };
                        newTotal.sun = newRows.reduce(
                          (sum, row) => sum + (row.hours.sun || 0),
                          0
                        );
                        newTotal.overall =
                          Object.values(newTotal).reduce((a, b) => a + b, 0) -
                          newTotal.overall;
                        setTotal(newTotal);
                      }}
                    />
                  )}
                />
                <Column
                  field="total"
                  style={{ fontWeight: "bold" }}
                  editor={false}
                />
                <Column
                  body={(rowData, column) => (
                    <Button label="+" onClick={addRow} />
                  )}
                />
                <Column
                  body={(rowData, column) =>
                    rows.length > 1 ? (
                      <Button
                        label="-"
                        onClick={() => removeRow(rows.indexOf(rowData))}
                      />
                    ) : null
                  }
                />
              </DataTable>
              <Button
                label="Save"
                icon="pi pi-save"
                className="p-button-help"
                onClick={saveData}
              />
              <Button
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
