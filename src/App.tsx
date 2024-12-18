import "./App.css";
import { useEffect, useRef, useState } from "react";

import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel"; // Import OverlayPanel

import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primeicons/primeicons.css";

import axios from "axios";

type Fields = {
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
};

function App() {
  const [field, setFields] = useState<Fields[]>([]); // State to store data
  const [currentPage, setCurrentPage] = useState<number>(0); // Zero-based index for current page
  const [totalRecords, setTotalRecords] = useState<number>(0); // Total number of records
  const [selectedFields, setSelectedFields] = useState<Fields[]>([]); // Selected rows
  const [fieldsNum, setFieldsNum] = useState<number>(0); // To track number of selected rows

  const op = useRef<OverlayPanel>(null); // Correctly typed useRef

  const rowsPerPage = 12; // Number of rows per page

  const fetchData = async (page: number) => {
    try {
      const response = await axios.get<{
        data: Fields[];
        pagination: { total: number };
      }>(`https://api.artic.edu/api/v1/artworks?page=${page + 1}`); // API expects 1-based pages
      setFields(response.data.data);
      setTotalRecords(response.data.pagination.total);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const onPageChange = (event: DataTablePageEvent) => {
    if (typeof event.page === "number") {
      setCurrentPage(event.page);
    }
  };

  // Custom Header for Title Column
  const titleHeaderTemplate = () => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <i
          className="pi pi-chevron-down"
          style={{ fontSize: "1rem", color: "#6c757d", cursor: "pointer" }}
          onClick={(e) => op.current?.toggle(e)} // Optional chaining
        ></i>
        <span>Title</span>
        <OverlayPanel ref={op}>
          <input type="number"></input>
          <br></br>
          <button>select</button>
        </OverlayPanel>
      </div>
    );
  };

  // Handle row selection change
  const handleSelectionChange = (e: { value: Fields[] }) => {
    setSelectedFields(e.value);
    setFieldsNum(e.value.length); // Update fieldsNum based on selected rows
  };

  return (
    <>
      <div className="card">
        <DataTable
          value={field}
          paginator
          lazy
          rows={rowsPerPage}
          totalRecords={totalRecords}
          first={currentPage * rowsPerPage}
          onPage={onPageChange}
          selectionMode="multiple"
          selection={selectedFields}
          onSelectionChange={handleSelectionChange} // Update fieldsNum on selection change
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3rem" }}
          ></Column>

          <Column field="title" header={titleHeaderTemplate}></Column>
          <Column field="place_of_origin" header="Place of Origin"></Column>
          <Column field="artist_display" header="Artist Display"></Column>
          <Column field="date_start" header="Start Date"></Column>
          <Column field="date_end" header="End Date"></Column>
        </DataTable>

        {/* Display the number of selected rows */}
        <div>Number of selected rows: {fieldsNum}</div>
      </div>
    </>
  );
}

export default App;
