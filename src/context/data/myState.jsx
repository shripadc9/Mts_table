import React, { useState } from "react";
import MyContext from "./myContext";

const MyState = (props) => {
  const [mode, setMode] = useState("light"); // Fix: Use array destructuring

  const toggleMode = () => {
    if (mode === "light") {
      setMode("dark");
      document.body.style.backgroundColor = "#333"; // Set dark mode background
    } else {
      setMode("light");
      document.body.style.backgroundColor = "#fff"; // Set light mode background
    }
  };

  const [loading, setLoading] = useState(false);

  return (
    <MyContext.Provider value={{ mode, toggleMode, loading, setLoading }}>
      {props.children}
    </MyContext.Provider>
  );
};

export default MyState;
