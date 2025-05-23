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

export const router = createBrowserRouter([

    {
        element: <RootWithModal></RootWithModal>,
        errorElement: <NotFound></NotFound>,
        children: [
            {
                path: '/',
                loader: () => fetch('https://roshoi-bondhu-server.vercel.app/top-recipes'),
                errorElement: <NotFound></NotFound>,
                Component: MainLayout
            },
            {
                path: '/add-recipe',
                element: <PrivateRoute>
                    <AddRecipe></AddRecipe>
                </PrivateRoute>
            },
            {
                path: '/recipe-details/:id',
                loader: ({ params }) => fetch(`https://roshoi-bondhu-server.vercel.app/AllRecipes/${params.id}`),
                Component: RecipeDetails
            },
            {
                path: '/all-recipes',
                loader: () => fetch('https://roshoi-bondhu-server.vercel.app/AllRecipes'),
                Component: AllRecipes
            },
            {
                path: '/my-account',
                Component: MyAccount
            },
            {
                path: '/my-recipes',
                element: <PrivateRoute>
                    <MyRecipes></MyRecipes>
                </PrivateRoute>
            }

        ]
    }


])