import React, { useState, useEffect, useRef } from "react";

const MatchVisualizer = ({ title, match }) => {
  const [cellPositions, setCellPositions] = useState({});
  const tableRef = useRef(null);

  const data = match?.matrix ?? []; // This is your matrix

  // Identify label types (fap, sap, tap, 4ap, etc.)
  const getPatternType = (cell) => {
    if (!cell || typeof cell !== "string") return null;
    const match = cell.match(/\+(\d*[a-z]*ap)/i);
    return match ? match[1] : null;
  };

  // Group cell occurrences
  const findPatternGroups = () => {
    const groups = {};
    data.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        const type = getPatternType(cell);
        if (type) {
          if (!groups[type]) groups[type] = [];
          groups[type].push({
            row: rowIdx,
            col: colIdx,
            cell,
          });
        }
      });
    });
    return groups;
  };

  const patternGroups = findPatternGroups();

  const colors = [
    "#ef4444", "#3b82f6", "#10b981",
    "#f59e0b", "#8b5cf6", "#ec4899",
    "#14b8a6", "#f97316",
  ];

  // Assign consistent colors
  const patternColors = {};
  Object.keys(patternGroups).forEach((pt, idx) => {
    patternColors[pt] = colors[idx % colors.length];
  });

  // Track cell coordinates
  useEffect(() => {
    setTimeout(() => {
      if (!tableRef.current) return;
      const pos = {};
      const rect = tableRef.current.getBoundingClientRect();

      tableRef.current.querySelectorAll("td").forEach((cell) => {
        const key = cell.dataset.key;
        const r = cell.getBoundingClientRect();
        if (key) {
          pos[key] = {
            x: r.left - rect.left + r.width / 2,
            y: r.top - rect.top + r.height / 2,
          };
        }
      });

      setCellPositions(pos);
    }, 250);
  }, [data]);

  const getCleanValue = (cell) => cell?.replace(/\+[0-9a-zA-Z]+ap/g, "") ?? "";

  return (
    <div className="p-4 bg-white shadow rounded-md mb-6">
      <h3 className="font-bold text-lg mb-2">{title}</h3>

      <p className="text-sm text-gray-600 mb-3">
        Mode: <b>{match.mode}</b> — Predicted:{" "}
        <b style={{ color: match.predicted ? "green" : "red" }}>
          {match.predicted ? "YES" : "NO"}
        </b>
      </p>

      <div className="relative inline-block">
        {/* LINES SVG */}
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: "100%", height: "100%", zIndex: 2 }}
        >
          {Object.entries(patternGroups).map(([type, positions]) => {
            const color = patternColors[type];

            return positions.slice(0, -1).map((start, idx) => {
              const end = positions[idx + 1];

              const p1 = cellPositions[start.row + "-" + start.col];
              const p2 = cellPositions[end.row + "-" + end.col];

              if (!p1 || !p2) return null;

              // SAME ROW → DRAW CURVED ARC
              if (start.row === end.row) {
                const midX = (p1.x + p2.x) / 2;
                const curveOffset =  -25;

                return (
                  <path
                    key={type + "_curve_" + idx}
                    d={`M ${p1.x-3} ${p1.y-8} Q ${midX} ${p1.y + curveOffset} ${p2.x-3} ${p2.y-8}`}
                    stroke={color}
                    strokeWidth="3"
                    fill="transparent"
                  />
                );
              }

              // NORMAL ROW CHANGE → straight line
              return (
                <line
                  key={type + "_line_" + idx}
                  x1={p1.x-11}
                  y1={p1.y+3}
                  x2={p2.x-4}
                  y2={p2.y-8}
                  stroke={color}
                  strokeWidth="3"
                />
              );
            });
          })}
        </svg>

        {/* TABLE */}
        <table ref={tableRef} className="border-collapse bg-white shadow relative">
          <tbody>
            {data.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => {
                  const type = getPatternType(cell);
                  const bg = type ? `${patternColors[type]}20` : "white";
                  const textColor = type ? patternColors[type] : "#333";

                  return (
                    <td
                      key={`${r}-${c}`}
                      data-key={`${r}-${c}`}
                      className="border px-4 py-2 text-center font-semibold relative"
                      style={{
                        backgroundColor: bg,
                        color: textColor,
                      }}
                    >
                      {getCleanValue(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GROUP DISPLAY */}
      <div className="mt-4">
        <h4 className="font-semibold text-sm mb-2">Pattern Types Found</h4>
        {Object.entries(patternColors).map(([t, col]) => (
          <div className="text-xs mb-1 flex gap-2 items-center" key={t}>
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: col }}
            />
            {t.toUpperCase()} ({patternGroups[t].length})
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchVisualizer;
