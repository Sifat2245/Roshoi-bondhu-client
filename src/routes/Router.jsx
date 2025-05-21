import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import AddRecipe from "../pages/AddRecipe";
import RecipeDetails from "../pages/RecipeDetails";

export const router = createBrowserRouter([
    {
        path:'/',
        loader: () => fetch('http://localhost:3000/AllRecipes'),
        Component: MainLayout
    },
    {
        path: '/add-recipe',
        Component: AddRecipe
    },
    {
        path: '/recipe-details',
        loader: () => fetch('http://localhost:3000/:id'),
        Component: RecipeDetails
    }
])