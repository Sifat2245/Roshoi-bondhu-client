import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import AddRecipe from "../pages/AddRecipe";
import RecipeDetails from "../pages/RecipeDetails";
import AllRecipes from "../pages/AllRecipes";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
    {
        path:'/',
        loader: () => fetch('http://localhost:3000/top-recipes'),
        errorElement: <NotFound></NotFound>,
        Component: MainLayout
    },
    {
        path: '/add-recipe',
        Component: AddRecipe
    },
    {
        path: '/recipe-details/:id',
        loader: ({params}) => fetch(`http://localhost:3000/AllRecipes/${params.id}`),
        Component: RecipeDetails
    },
    {
        path: '/all-recipes',
         loader: () => fetch('http://localhost:3000/AllRecipes'),
        Component: AllRecipes
    }
])