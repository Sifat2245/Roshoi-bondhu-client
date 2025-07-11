import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import AddRecipe from "../pages/AddRecipe";
import RecipeDetails from "../pages/RecipeDetails";
import AllRecipes from "../pages/AllRecipes";
import NotFound from "../pages/NotFound";
import MyAccount from "../pages/MyAccount";
import MyRecipes from "../pages/MyRecipes";
import RootWithModal from "../components/RootWithModal";
import PrivateRoute from "./PrivateRoute";
import AboutUs from "../pages/AboutUs";
import Dashboard from "../pages/Dashboard";
import Categories from "../pages/Categories";
import Cuisine from "../pages/Cuisine";
import Blogs from "../pages/Blogs";

export const router = createBrowserRouter([
  {
    element: <RootWithModal></RootWithModal>,
    errorElement: <NotFound></NotFound>,
    children: [
      {
        path: "/",
        loader: () =>
          fetch("https://roshoi-bondhu-server.vercel.app/top-recipes"),
        errorElement: <NotFound></NotFound>,
        Component: MainLayout,
      },
      {
        path: "/add-recipe",
        element: (
          <PrivateRoute>
            <AddRecipe></AddRecipe>
          </PrivateRoute>
        ),
      },
      {
        path: "/recipe-details/:id",
        loader: ({ params }) =>
          fetch(
            `https://roshoi-bondhu-server.vercel.app/AllRecipes/${params.id}`
          ),
        element: (
          <PrivateRoute>
            <RecipeDetails></RecipeDetails>
          </PrivateRoute>
        ),
      },
      {
        path: "/all-recipes",
        loader: () =>
          fetch("https://roshoi-bondhu-server.vercel.app/AllRecipes"),
        Component: AllRecipes,
      },

      {
        path: "/my-recipes",
        element: (
          <PrivateRoute>
            <MyRecipes></MyRecipes>
          </PrivateRoute>
        ),
      },
      {
        path: '/cuisine',
        Component: Cuisine
      },
      {
        path: '/categories',
        Component: Categories
      },
      {
        path: '/blogs',
        Component: Blogs
      },
      {
        path: "/about-us",
        Component: AboutUs,
      },
      {
        path: "/dashboard",
        element: <PrivateRoute>
            <Dashboard></Dashboard>
        </PrivateRoute>,
        children: [
          {
            path: "/dashboard/my-account",
            Component: MyAccount,
          },
        ],
      },
    ],
  },
]);
