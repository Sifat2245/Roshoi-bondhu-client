import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import AddRecipe from "../pages/AddRecipe";
import RecipeDetails from "../pages/RecipeDetails";
import AllRecipes from "../pages/AllRecipes";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
    {
        path:'/',
        loader: () => fetch('https://roshoi-bondhu-server.vercel.app/top-recipes'),
        errorElement: <NotFound></NotFound>,
        Component: MainLayout
    },
    {
        path: '/add-recipe',
        Component: AddRecipe
    },
    {
        path: '/recipe-details/:id',
        loader: ({params}) => fetch(`https://roshoi-bondhu-server.vercel.app/AllRecipes/${params.id}`),
        Component: RecipeDetails
    },
    {
        path: '/all-recipes',
         loader: () => fetch('https://roshoi-bondhu-server.vercel.app/AllRecipes'),
        Component: AllRecipes
    }
])