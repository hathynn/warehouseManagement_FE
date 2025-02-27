import { USER_ROUTER } from "@/constants/routes";
import Login from "@/pages/auth/login";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: USER_ROUTER.LOGIN,
    element: <Login/>,
  },
  {
    path: "/",
    element: <Login/>,
  },
]);
