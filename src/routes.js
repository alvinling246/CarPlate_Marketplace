import React from "react";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <div><h1>Home Page</h1><p>This is a test</p></div>,
  },
  {
    path: "/test",
    element: <div><h1>Test Page</h1><p>This is another test</p></div>,
  },
]);
