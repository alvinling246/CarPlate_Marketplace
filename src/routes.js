import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root.jsx";
import { UserView } from "./components/UserView.jsx";
import { DealerView } from "./components/DealerView.jsx";
import { AdminView } from "./components/AdminView.jsx";
import { NotFound } from "./components/NotFound.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: UserView },
      { path: "dealer", Component: DealerView },
      { path: "admin", Component: AdminView },
      { path: "*", Component: NotFound },
    ],
  },
]);
