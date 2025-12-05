import React, { useState, useEffect, useRef } from "react";

const Tpattern = ({ processedMatrix, tableName }) => {
  if (!processedMatrix || processedMatrix.length === 0) {
    return null;
  }

  // Helper: convert 0 to "00"
  const formatCellValue = (value) => {
    return value === 0 || value === "0" ? "00" : value;
  };

  // Device states and layout.
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const tableContainerRef = useRef(null);
  const firstTableRef = useRef(null);
  const [manualScale, setManualScale] = useState(
    () => localStorage.getItem("manualScale") === "true"
  );
  const [scale, setScale] = useState(() => {
    const savedScale = localStorage.getItem("scale");
    return savedScale ? parseFloat(savedScale) : 0.6;
  });
  const [scrollLocked, setScrollLocked] = useState(true);

  // Update scroll position when locked.
  useEffect(() => {
    if (scrollLocked) {
      const scrollableDivs = document.querySelectorAll(".table-scrollable");
      scrollableDivs.forEach((div) => {
        div.scrollTop = 0;
      });
    }
  }, [scrollLocked]);

  // Persist zoom settings.
  useEffect(() => {
    localStorage.setItem("scale", scale);
    localStorage.setItem("manualScale", manualScale);
  }, [scale, manualScale]);

  // Update device info and default scale.
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsDesktop(width >= 1024);
      if (!manualScale && firstTableRef.current) {
        const availableWidth = width - 40;
        const tableWidth = firstTableRef.current.offsetWidth;
        const fitScale = availableWidth / tableWidth;
        setScale(fitScale < 0.6 ? fitScale : 0.6);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [manualScale]);

  // Determine days based on columns of the first matrix row.
  const firstMatrixRow =
    Array.isArray(processedMatrix[0]) && processedMatrix[0].length > 0
      ? processedMatrix[0][0]
      : [];
  const columnsPerRow = firstMatrixRow.length;
  let days;
  if (columnsPerRow === 16) {
    days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  } else if (columnsPerRow === 19) {
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  } else if (columnsPerRow === 22) {
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  } else {
    days = [];
  }

  // Append three empty rows if needed.
  const prepareMatrixData = (data) => {
    const matrix = Array.isArray(data) ? data : [data];
    const expectedCells = 1 + days.length * 3; // 1 for week + 3 per day
    const emptyRow = Array(expectedCells).fill("");
    return [...matrix, emptyRow, emptyRow, emptyRow];
  };

  // Ensure all patterns have equal row counts.
  const rowCount1 = processedMatrix[0]?.length || 0;
  const rowCount2 = processedMatrix[1]?.length || 0;
  const rowCount3 = processedMatrix[2]?.length || 0;

  const matrixData1 = processedMatrix[0];
  const matrixData2 = processedMatrix[1];
  let matrixData3 = processedMatrix[2];
  if (rowCount1 !== rowCount2 || rowCount2 !== rowCount3) {
    matrixData3 = prepareMatrixData(matrixData3);
  }

  const tables = [
    { id: 1, title: " First Pattern", data: matrixData1 },
    { id: 2, title: " Second Pattern", data: matrixData2 },
    { id: 3, title: " Third Pattern", data: matrixData3 },
  ];

  // Each table has its own search state.
  const initialTableSearchData = tables.map(() => ({
    searchValues: Array(days.length).fill(""),
    showExtraRow: false,
    currentMatchIndex: null,
  }));
  const [tableSearchData, setTableSearchData] = useState(
    initialTableSearchData
  );

  // Helper functions.
  const splitPana = (pana) => {
    pana = formatCellValue(pana);
    if (pana === "None") return ["", "", ""];
    return pana === "***" ? ["*", "*", "*"] : pana.toString().split("");
  };

  // Calculate top digit according to the D-rule.
  const calculateTopDigit = (firstDigit, secondDigit) => {
    if (!firstDigit || !secondDigit) return "";
    const a = parseInt(firstDigit, 10);
    const b = parseInt(secondDigit, 10);
    const diff = a > b ? Math.abs(a - (b + 10)) : Math.abs(a - b);
    return diff.toString();
  };

  const getJodiParts = (jodi) => {
    jodi = formatCellValue(jodi);
    if (!jodi || jodi === "None" || jodi.toString().trim() === "") {
      return {
        top: "",
        main: "",
        bottom: "",
        hasJ: false,
        hasOP: false,
        hasC: false,
        hasT: false,
        hasD: false,
        hasL: false,
        hasR: false,
      };
    }
    if (jodi === "**") {
      return {
        top: "*",
        main: "**",
        bottom: "*",
        hasJ: false,
        hasOP: false,
        hasC: false,
        hasT: false,
        hasD: false,
        hasL: false,
        hasR: false,
      };
    }
    const jodiStr = jodi.toString();
    const hasJ = jodiStr.includes("J");
    const hasOP = jodiStr.includes("OP");
    const hasC = jodiStr.includes("C");
    const hasT = jodiStr.includes("T");
    const hasD = jodiStr.includes("D");
    const hasL = jodiStr.includes("L");
    const hasR = jodiStr.includes("R");
    let value = jodiStr.replace(/[^0-9]/g, "");
    if (value === "") {
      return {
        top: "",
        main: "",
        bottom: "",
        hasJ: false,
        hasOP: false,
        hasC: false,
        hasT: false,
        hasD: false,
        hasL: false,
        hasR: false,
      };
    }
    const paddedValue =
      value.length === 1 ? "0" + value : value.padStart(2, "0");
    const firstDigit = paddedValue[0];
    const secondDigit = paddedValue[1];
    const bottomDigit = (
      (parseInt(firstDigit) + parseInt(secondDigit)) %
      10
    ).toString();
    const topDigit = calculateTopDigit(firstDigit, secondDigit);
    return {
      top: topDigit,
      main: paddedValue,
      bottom: bottomDigit,
      hasJ,
      hasOP,
      hasC,
      hasT,
      hasD,
      hasL,
      hasR,
    };
  };

  const renderJodiMain = (main, { hasJ, hasOP, hasC }) => {
    if (main === "") {
      return (
        <span className="text-black text-xl font-bold leading-none">
          &#160;
        </span>
      );
    }
    if (main === "**") {
      return (
        <span className="text-black text-xl font-bold leading-none">
          {main}
        </span>
      );
    }
    const digits = main.split("");
    return (
      <span className="text-black text-xl font-bold leading-none flex">
        <span
          className={`${hasJ ? "bg-blue-400" : hasOP ? "bg-green-400" : ""}`}
        >
          {digits[0] || "\u00A0"}
        </span>
        <span
          className={`${hasJ ? "bg-blue-400" : hasC ? "bg-purple-400" : ""}`}
        >
          {digits[1] || "\u00A0"}
        </span>
      </span>
    );
  };

  const getTopDigitClass = ({ hasD }) =>
    hasD ? "bg-yellow-300 text-[12px]" : "text-[12px]";
  const getBottomDigitClass = ({ hasT }) =>
    hasT ? "bg-orange-400 text-[12px]" : "text-[12px]";

  // Matching logic.
  const matchJodi = (jodiMain, searchValue) => {
    if (!searchValue) return false;
    const trimmed = searchValue.trim();

    if (trimmed.includes(",")) {
      const parts = trimmed.split(",").map((s) => s.trim());
      if (parts.length === 2 && parts[0] !== "" && parts[1] !== "") {
        if (jodiMain && jodiMain.length >= 2) {
          return (
            jodiMain.charAt(0) === parts[0] && jodiMain.charAt(1) === parts[1]
          );
        }
        return false;
      }
    }

    if (trimmed.startsWith("T") && trimmed.length >= 2) {
      const required = trimmed.charAt(1);
      if (jodiMain && jodiMain.length >= 2) {
        const sum =
          parseInt(jodiMain.charAt(0), 10) + parseInt(jodiMain.charAt(1), 10);
        return (sum % 10).toString() === required;
      }
      return false;
    } else if (trimmed.startsWith("*") && trimmed.length >= 2) {
      return (
        jodiMain &&
        jodiMain.length >= 2 &&
        jodiMain.charAt(1) === trimmed.charAt(1)
      );
    } else if (trimmed.endsWith("*") && trimmed.length >= 2) {
      return jodiMain && jodiMain.charAt(0) === trimmed.charAt(0);
    } else if (trimmed.startsWith("D") && trimmed.length >= 2) {
      const required = parseInt(trimmed.charAt(1), 10);
      if (jodiMain && jodiMain.length >= 2) {
        const a = parseInt(jodiMain.charAt(0), 10);
        const b = parseInt(jodiMain.charAt(1), 10);
        let diff;
        if (a <= b) {
          diff = Math.abs(a - b);
        } else {
          diff = Math.abs(a - (b + 10));
        }
        return diff === required;
      }
      return false;
    }
    return jodiMain === trimmed;
  };

  const isRowMatch = (row, searchValues) => {
    let atLeastOne = false;
    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const searchValue = searchValues[dayIndex];
      if (searchValue !== "") {
        atLeastOne = true;
        const baseIndex = 1 + dayIndex * 3;
        const jodi = formatCellValue(row[baseIndex + 1]);
        const jodiParts = getJodiParts(jodi);
        if (!matchJodi(jodiParts.main, searchValue)) {
          return false;
        }
      }
    }
    return atLeastOne;
  };

  // Helper: scroll a row into view vertically without affecting horizontal scroll.
  // Adjusted to account for the current scale value and an extra margin (for zoom-out).
  const scrollRowIntoView = (rowElement) => {
    if (rowElement) {
      const container = rowElement.closest(".table-scrollable");
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const rowRect = rowElement.getBoundingClientRect();
        // Extra margin to push the row further up when zoomed out.
        const extraMargin = 30; // adjust this value as needed
        const offset =
          (rowRect.top -
            containerRect.top -
            container.clientHeight / 2 +
            rowRect.height / 2 -
            extraMargin) /
          scale;
        const newScrollTop = container.scrollTop + offset;
        container.scrollTo({
          top: newScrollTop,
          left: container.scrollLeft,
          behavior: "smooth",
        });
      }
    }
  };

  // Function to trigger search submit.
  const handleSearchSubmit = (tableIndex) => {
    const tableData = tables[tableIndex].data;
    const currentSearchDataForTable = tableSearchData[tableIndex];
    const matchingIndices = tableData.reduce((acc, row, index) => {
      if (index <= 9) return acc;
      if (isRowMatch(row, currentSearchDataForTable.searchValues)) {
        acc.push(index);
      }
      return acc;
    }, []);
    if (matchingIndices.length > 0) {
      setTableSearchData((prev) => {
        const newData = [...prev];
        newData[tableIndex] = {
          ...newData[tableIndex],
          currentMatchIndex: matchingIndices[0],
        };
        return newData;
      });
      if (!scrollLocked) {
        const matchElem = document.getElementById(`match-${tableIndex}`);
        if (matchElem) {
          scrollRowIntoView(matchElem);
        }
      }
    }
  };

  useEffect(() => {
    if (!scrollLocked) {
      tableSearchData.forEach((data, tableIndex) => {
        if (data.currentMatchIndex !== null) {
          const elem = document.getElementById(`match-${tableIndex}`);
          if (elem) {
            scrollRowIntoView(elem);
          }
        }
      });
    }
  }, [tableSearchData, scrollLocked]);

  // Render each table.
  const renderTable = (matrixData, tableRef, tableIndex) => {
    const matchingIndices = matrixData.reduce((acc, row, index) => {
      if (index <= 9) return acc;
      if (isRowMatch(row, tableSearchData[tableIndex].searchValues)) {
        acc.push(index);
      }
      return acc;
    }, []);
    const currentSearchData = tableSearchData[tableIndex];

    return (
      <div className="overflow-x-auto border border-[#6D0B3E]" dir="ltr">
        <div
          className="table-scrollable"
          style={
            matrixData.length > 14
              ? {
                  maxHeight: "700px",
                  overflowY: scrollLocked ? "hidden" : "auto",
                }
              : {}
          }
        >
          <table
            ref={tableRef}
            className="min-w-max table-fixed border-collapse text-sm"
          >
            <thead>
              <tr className="bg-[#6D0B3E] text-white">
                <th
                  style={{ verticalAlign: "top" }}
                  className="border border-gray-300 w-8"
                >
                  Week
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    style={{ verticalAlign: "top" }}
                    className="border border-gray-300 w-8"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixData.map((row, rowIndex) => {
                let rowBg =
                  rowIndex === 9
                    ? "bg-yellow-100"
                    : rowIndex % 2 === 0
                    ? "bg-gray-50"
                    : "bg-white";
                const isCurrentMatch =
                  rowIndex === currentSearchData.currentMatchIndex;
                return (
                  <React.Fragment key={rowIndex}>
                    <tr
                      id={isCurrentMatch ? `match-${tableIndex}` : undefined}
                      className={rowBg}
                    >
                      <td className="border border-gray-300 text-center text-[10px] whitespace-pre-line leading-none h-10">
                        <div className="flex flex-col items-center">
                          {isCurrentMatch ? (
                            <>
                              <span className="bg-red-300 px-1">
                                {formatCellValue(row[0])}
                              </span>
                              {matchingIndices.indexOf(rowIndex) !== -1 &&
                                matchingIndices.indexOf(rowIndex) <
                                  matchingIndices.length - 1 && (
                                  <button
                                    onClick={() => {
                                      const pos =
                                        matchingIndices.indexOf(rowIndex);
                                      const nextIndex =
                                        matchingIndices[pos + 1];
                                      setTableSearchData((prev) => {
                                        const newData = [...prev];
                                        newData[tableIndex] = {
                                          ...newData[tableIndex],
                                          currentMatchIndex: nextIndex,
                                        };
                                        return newData;
                                      });
                                    }}
                                    className="mt-1 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                                  >
                                    Next
                                  </button>
                                )}
                            </>
                          ) : (
                            formatCellValue(row[0]).replace(" to ", "\nto\n")
                          )}
                          {rowIndex === 9 && (
                            <button
                              onClick={() =>
                                setTableSearchData((prev) => {
                                  const newData = [...prev];
                                  newData[tableIndex] = {
                                    ...newData[tableIndex],
                                    showExtraRow:
                                      !newData[tableIndex].showExtraRow,
                                  };
                                  return newData;
                                })
                              }
                              className="mt-1 text-xs bg-blue-200 px-1 rounded"
                            >
                              {currentSearchData.showExtraRow ? "Hide" : "Show"}
                            </button>
                          )}
                        </div>
                      </td>
                      {days.map((day, dayIndex) => {
                        const baseIndex = 1 + dayIndex * 3;
                        const op = formatCellValue(row[baseIndex]);
                        const jodi = formatCellValue(row[baseIndex + 1]);
                        const cp = formatCellValue(row[baseIndex + 2]);
                        const jodiParts = getJodiParts(jodi);
                        const isDayMatch =
                          rowIndex === currentSearchData.currentMatchIndex &&
                          currentSearchData.searchValues[dayIndex] !== "" &&
                          matchJodi(
                            jodiParts.main,
                            currentSearchData.searchValues[dayIndex]
                          );
                        return (
                          <td
                            key={dayIndex}
                            className={`border border-gray-300 h-10 ${
                              isDayMatch ? "bg-yellow-300" : ""
                            }`}
                          >
                            <div className="flex justify-center items-center h-full">
                              <div className="flex items-center space-x-0">
                                <div className="flex flex-col items-center w-3">
                                  {splitPana(op).map((digit, idx) => (
                                    <span
                                      key={idx}
                                      className="text-black text-[12px] leading-none"
                                    >
                                      {digit || "\u00A0"}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex flex-col items-center w-5">
                                  {jodiParts.hasL && (
                                    <span className="text-[16px] font-bold leading-none -mt-1">
                                      →
                                    </span>
                                  )}
                                  <span
                                    className={`text-gray-900 leading-none ${getTopDigitClass(
                                      jodiParts
                                    )}`}
                                  >
                                    {jodiParts.top || "\u00A0"}
                                  </span>
                                  {renderJodiMain(jodiParts.main, jodiParts)}
                                  <span
                                    className={`text-gray-900 leading-none ${getBottomDigitClass(
                                      jodiParts
                                    )}`}
                                  >
                                    {jodiParts.bottom || "\u00A0"}
                                  </span>
                                  {jodiParts.hasR && (
                                    <span className="text-[16px] font-bold leading-none -mt-1">
                                      ←
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col items-center w-3">
                                  {splitPana(cp).map((digit, idx) => (
                                    <span
                                      key={idx}
                                      className="text-black text-[12px] leading-none"
                                    >
                                      {digit || "\u00A0"}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    {rowIndex === 9 && currentSearchData.showExtraRow && (
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 bg-gray-50 text-center text-[10px] whitespace-pre-line leading-none h-12">
                          <button
                            onClick={() => handleSearchSubmit(tableIndex)}
                            className="px-2 py-1 bg-green-500 text-white rounded"
                          >
                            Submit
                          </button>
                        </td>
                        {days.map((day, i) => (
                          <td
                            key={i}
                            className="border border-gray-300 bg-gray-50 h-12"
                          >
                            <input
                              type="text"
                              value={currentSearchData.searchValues[i]}
                              onChange={(e) => {
                                setTableSearchData((prev) => {
                                  const newData = [...prev];
                                  const updatedSearchValues = [
                                    ...newData[tableIndex].searchValues,
                                  ];
                                  updatedSearchValues[i] = e.target.value;
                                  newData[tableIndex] = {
                                    ...newData[tableIndex],
                                    searchValues: updatedSearchValues,
                                    currentMatchIndex: null,
                                  };
                                  return newData;
                                });
                              }}
                              className="w-full h-full p-1 text-center bg-gray-50 text-[24px] font-bold placeholder:text-sm"
                              placeholder={`Input ${i + 1}`}
                            />
                          </td>
                        ))}
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Adjust container transform origin:
  // On mobile (or when zoomed in), center horizontally.
  const transformOrigin = isMobile
    ? "center top"
    : isHorizontal
    ? "left top"
    : "center top";

  const containerClass = isHorizontal
    ? "flex justify-start gap-4 items-start"
    : "flex flex-col gap-4 items-start";

  const renderContent = () => (
    <div className="px-4 w-full">
      <div
        ref={tableContainerRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin,
          transition: "transform 0.1s ease-out",
        }}
        className={containerClass}
      >
        {tables.map((table, index) => (
          <div key={table.id} className="flex flex-col">
            <h2 className="text-xl font-semibold mb-1 text-center">
              <a
                href="https://matkatricksearch.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                matkatricksearch.in
              </a>
              {table.title}
            </h2>
            {renderTable(table.data, index === 0 ? firstTableRef : null, index)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="overflow-auto w-full h-full">
      <div className="text-center">
        <div className="mb-2 mt-4 flex justify-center">
          <button
            onClick={() => setIsHorizontal(!isHorizontal)}
            className="px-4 py-2 bg-[#6D0B3E] text-white rounded hover:bg-[#941255]"
          >
            {isHorizontal ? "View Vertical" : "View Horizontal"}
          </button>
        </div>
        <div className="flex justify-around gap-2 mt-2">
          <button
            onClick={() => {
              setScale((prev) => Math.min(prev + 0.075, 3));
              setManualScale(true);
            }}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm"
          >
            Zoom In
          </button>
          <button
            onClick={() => {
              setScale((prev) => Math.max(prev - 0.075, 0.5));
              setManualScale(true);
            }}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm"
          >
            Zoom Out
          </button>
          <button
            onClick={() => {
              setScale(0.6);
              setManualScale(false);
            }}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm"
          >
            Reset Zoom
          </button>
          <button
            onClick={() => setScrollLocked((prev) => !prev)}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm"
          >
            {scrollLocked ? "Unlock Scroll" : "Lock Scroll"}
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Tpattern;
