import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import AddRecipe from "../pages/AddRecipe";

export const router = createBrowserRouter([
    {
        path:'/',
        Component: MainLayout
    },
    {
        path: '/add-recipe',
        Component: AddRecipe
    }
])