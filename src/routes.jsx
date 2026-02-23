import React from "react";
import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root.jsx";
import { UserView } from "./components/UserView.jsx";
import { DealerView } from "./components/DealerView.jsx";
import { AdminViewProtected } from "./components/AdminViewProtected.jsx";
import { NotFound } from "./components/NotFound.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <UserView /> },
      { path: "dealer", element: <DealerView /> },
      { path: "admin", element: <AdminViewProtected /> },
      { path: "admin/dealers", element: <AdminViewProtected /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
