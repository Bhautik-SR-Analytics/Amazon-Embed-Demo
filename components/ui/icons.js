import React from "react";

// Define your custom icons
const BIIcons = {
  reports: (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.625 2.625V18.375H18.375" stroke="#333333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.375 14.875V7.875" stroke="#333333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.75 14.875V4.375" stroke="#333333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 14.875V12.25" stroke="#333333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ai: (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18.375 10.5V16.625C18.375 17.0891 18.1906 17.5342 17.8624 17.8624C17.5342 18.1906 17.0891 18.375 16.625 18.375H4.375C3.91087 18.375 3.46575 18.1906 3.13756 17.8624C2.80937 17.5342 2.625 17.0891 2.625 16.625V4.375C2.625 3.91087 2.80937 3.46575 3.13756 3.13756C3.46575 2.80937 3.91087 2.625 4.375 2.625H14"
        stroke="#333333"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.69886 14H6.1875L8.15057 8.18182H10.0227L11.9858 14H10.4744L9.10795 9.64773H9.0625L7.69886 14ZM7.49716 11.7102H10.6562V12.7784H7.49716V11.7102ZM14.0185 8.18182V14H12.6122V8.18182H14.0185Z"
        fill="#333333"
      />
      <path d="M17.5 3V8" stroke="#333333" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M15 5.5H20" stroke="#333333" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  home: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      class="lucide lucide-home"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
};

// Icon component
export const BIIcon = ({ name, size = 24, color = "currentColor" }) => {
  const iconSvg = BIIcons[name];

  return iconSvg ? (
    <div
      style={{
        width: size,
        height: size,
        display: "inline-block",
        lineHeight: 0,
      }}
    >
      {React.cloneElement(iconSvg, {
        width: size,
        height: size,
      })}
    </div>
  ) : null;
};
