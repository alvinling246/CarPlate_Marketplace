import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { UserView } from "./components/UserView";
import { DealerView } from "./components/DealerView";
import { AdminView } from "./components/AdminView";
import { NotFound } from "./components/NotFound";

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
