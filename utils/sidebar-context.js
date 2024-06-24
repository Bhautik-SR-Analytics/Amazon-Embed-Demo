"use client";
// contexts/SidebarContext.js
import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [specificSidebarData, setSpecificSidebarData] = useState(null);

    const updateSidebarData = (newData) => {
        setSpecificSidebarData(prevData => ({
            ...prevData,
            ...newData
        }));
    };

    return (
        <SidebarContext.Provider value={{ specificSidebarData, updateSidebarData }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => useContext(SidebarContext);