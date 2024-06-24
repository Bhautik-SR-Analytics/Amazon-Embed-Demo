"use client";
import { createContext, useContext, useReducer } from "react";

const AppContext = createContext();

export function AppContextWrapper({ children }) {
  const initialState = {
    reportSideBar: false,
    pdfData: {
      groupId: "",
      reportId: "",
      pageName: "",
    },
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_PDF_DATA":
        return {
          ...state,
          pdfData: { ...action.payload },
        };
      case "REPORT_SIDEBAR_TOGGLE":
        return {
          ...state,
          reportSideBar: !state.reportSideBar,
        };

      default:
        return state;
    }
  };

  const [siteGlobalState, dispatch] = useReducer(reducer, initialState);

  let sharedState = {
    siteGlobalState,
    setGlobalState: dispatch,
  };

  return <AppContext.Provider value={sharedState}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
