import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  results: [
    {
      title: "KALYAN",
      result: "199-97-250",
      time: "(09:40 - 10:40)",
      color: "green",
      jodiLink: "/kalyan-panel",
      panelLink: "/kalyan-panel",
    },
    {
      title: "MAIN BAZAR",
      result: "126-90-370",
      time: "(10:00 - 11:00)",
      color: "red",
      jodiLink: "/main-bazar-panel",
      panelLink: "/main-mumbai-panel",
    },
    {
      title: "MILAN DAY",
      result: "560-10-578",
      time: "(11:00 - 01:00)",
      color: "green",
      jodiLink: "/milan-day-panel",
      panelLink: "/milan-day-panel",
    },
    {
      title: "MILAN NIGHT",
      result: "200-23-247",
      time: "(11:20 - 12:20)",
      color: "red",
      jodiLink: "/milan-night-panel",
      panelLink: "/milan-night-panel",
    },
    {
      title: "MADHUR DAY",
      result: "200-23-247",
      time: "(11:20 - 12:20)",
      color: "green",
      jodiLink: "/madhur-day-panel",
      panelLink: "/madhur-day-panel",
    },
    {
      title: "MADHUR NIGHT",
      result: "200-23-247",
      time: "(11:20 - 12:20)",
      color: "yellow",
      jodiLink: "/madhur-night-panel",
      panelLink: "/madhur-night-panel",
    },
    {
      title: "RAJDHANI DAY",
      result: "780-52-390",
      time: "(11:35 - 12:35)",
      color: "green",
      jodiLink: "/rajdhani-day-panel",
      panelLink: "/rajdhani-day-panel",
    },
    {
      title: "RAJDHANI NIGHT",
      result: "259-63-256",
      time: "(11:35 - 12:35)",
      color: "red",
      jodiLink: "/rajdhani-night-panel",
      panelLink: "/rajdhani-night-panel",
    },
  ],
};

const matkaSlice = createSlice({
  name: "matka",
  initialState,
  reducers: {
    updateResult: (state, action) => {
      const { index, newResult } = action.payload;
      state.results[index] = newResult;
    },
    addNewResult: (state, action) => {
      state.results.push(action.payload);
    },
  },
});

export const { updateResult, addNewResult } = matkaSlice.actions;
export default matkaSlice.reducer;
