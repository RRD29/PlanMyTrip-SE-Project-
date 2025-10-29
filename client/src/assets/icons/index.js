import React from 'react';

// A generic function to pass props (like className for Tailwind)
const Icon = ({ children, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    {children}
  </svg>
);

// --- Individual Icons ---

// For User Profiles, Login, etc.
export const UserIcon = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A1.5 1.5 0 0118 21.75H6.75a1.5 1.5 0 01-1.249-1.632z"
    />
  </Icon>
);

// For Destinations, Location
export const MapPinIcon = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
    />
  </Icon>
);

// For Trip Duration, Availability
export const CalendarIcon = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
    />
  </Icon>
);

// For Reviews, Ratings (Filled)
export const StarIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.518.77 2.188l-4.254 3.917 1.17 5.259c.27 1.121-.977 2.016-1.928 1.418L12 18.273l-4.908 2.855c-.951.598-2.198-.297-1.928-1.418l1.17-5.259-4.254-3.917c-.866-.67-..394-2.095.77-2.188l5.404-.433L10.788 3.21z"
      clipRule="evenodd"
    />
  </svg>
);

// For Budget, Earnings
export const CurrencyDollarIcon = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0l.879-.659M12 6V5.25A2.25 2.25 0 009.75 3h-3.75A2.25 2.25 0 003.75 5.25V6m0 0v2.25A2.25 2.25 0 006 10.5h12A2.25 2.25 0 0020.25 8.25V6m-3.75 0v2.25A2.25 2.25 0 0018 10.5h-3.75a2.25 2.25 0 00-2.25 2.25V18m-3.75-9.75h9.75"
    />
  </Icon>
);

// For Chat
export const ChatBubbleIcon = (props) => (
    <Icon {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.86 8.25-8.625 8.25a9.75 9.75 0 01-4.375-.931l-3.328 1.424a.75.75 0 01-.976-.976l1.424-3.328A9.75 9.75 0 013 12c0-4.556 3.86-8.25 8.625-8.25S21 7.444 21 12z" />
    </Icon>
);