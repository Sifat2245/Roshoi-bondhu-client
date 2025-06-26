import React, { use, useEffect, useState } from "react";
import { Outlet, Link, useLocation, NavLink } from "react-router";
import {
  Plus,
  BookOpen,
  Heart,
  User,
  Edit,
  Trash2,
  ChevronDown,
  Search,
  Bell,
  Menu,
  X,
  View,
} from "lucide-react";
import { AuthContext } from "../authProvider/AuthProvider";

export const DashboardOverview = ({ myRecipes }) => {
  const handleAddNew = () => console.log("Add new recipe clicked");

  const StatCard = ({ icon, title, value, color, textColor }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 transition-transform transform hover:scale-105">
      <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-2xl font-bold ${textColor || "text-gray-800"}`}>
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<BookOpen size={24} className="text-red-600" />}
          title="Total Recipes"
          value={myRecipes.length}
          color="bg-red-100"
        />

        <StatCard
          icon={<Heart size={24} className="text-orange-600" />}
          title="Total Likes Received"
          value={myRecipes.reduce(
            (acc, recipe) => acc + (recipe.likeCount || 0),
            0
          )}
          color="bg-orange-100"
        />

        <Link to={"/add-recipe"}>
          <StatCard
            icon={<Plus size={24} className="text-sky-600" />}
            title="Add New Recipe"
            value="→"
            color="bg-sky-100"
          />
        </Link>
      </section>

      {myRecipes.length > 0 ? (
        <section className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold text-gray-800">My Recipes</h2>
            <Link to={"/add-recipe"}>
              <button
                onClick={handleAddNew}
                className="flex items-center bg-[#e02f21] text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors w-full sm:w-auto"
              >
                <Plus size={20} className="mr-2" /> Add New Recipe
              </button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-4 font-semibold text-gray-600">
                    Recipe Name
                  </th>
                  <th className="p-4 font-semibold text-gray-600 hidden md:table-cell">
                    Date Posted
                  </th>
                  <th className="p-4 font-semibold text-gray-600">Likes</th>
                  <th className="p-4 font-semibold text-gray-600 hidden sm:table-cell">
                    Status
                  </th>
                  <th className="p-4 font-semibold text-gray-600 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {myRecipes.map((recipe) => (
                  <tr key={recipe.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 flex items-center">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-16 h-12 object-cover rounded-md mr-4 hidden sm:block"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/100x60/e0e0e0/ffffff?text=Error";
                        }}
                      />
                      <Link to={`/recipe-details/${recipe._id}`}>
                        <span className="font-semibold text-gray-800 hover:text-red-500">
                          {recipe.title}
                        </span>
                      </Link>
                    </td>
                    <td className="p-4 text-gray-600 hidden md:table-cell">
                      {recipe.date}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {recipe.likeCount}
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${
                          recipe.status === "Published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        Published
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Link  to={`/recipe-details/${recipe._id}`}>
                        <button className="p-2 text-red-500 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors">
                          <View size={18} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="text-center mt-24 md:mt-48">
          <h1 className="md:text-2xl text-gray-500 font-semibold">
            You haven’t Post any Recipes yet!
          </h1>
        </div>
      )}
    </>
  );
};

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = use(AuthContext);
  const location = useLocation();

  console.log(myRecipes);

  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      fetch(`https://roshoi-bondhu-server.vercel.app/AllRecipe/${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setMyRecipes(data);
          setLoading(false);
        });
    }
  }, [user?.email]);

  return (
    <div className="bg-gray-50 min-h-screen flex">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 bg-white shadow-lg flex flex-col w-64 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-30`}
      >
        <div className="p-6 flex justify-between items-center border-b">
          <Link to={"/"}>
            <h1 className="text-xl font-bold text-[#e02f21]">Roshoi Bondhu</h1>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/dashboard"
                end
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg font-semibold ${
                    isActive
                      ? "text-red-600 bg-red-50"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <BookOpen className="w-5 h-5 mr-3" />
                My Recipes
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/liked"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg font-semibold ${
                    isActive
                      ? "text-red-600 bg-red-50"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <Heart className="w-5 h-5 mr-3 text-gray-400" />
                Liked Recipes
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/my-account"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg font-semibold ${
                    isActive
                      ? "text-red-600 bg-red-50"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <User className="w-5 h-5 mr-3 text-gray-400" />
                Profile
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-4 lg:p-8 border-b bg-white">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="lg:hidden mr-4 p-2 text-gray-600"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-800">
                Welcome Back {user?.displayName.split(" ")[0]}!
              </h1>
              <p className="text-gray-500 mt-1 text-xs md:text-base hidden sm:block">
                Manage your recipes and account.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-32 md:w-64 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Bell size={24} />
            </button>
            <div className="flex items-center space-x-2">
              <img
                src={user?.photoURL}
                alt="User Avatar"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full"
              />
              <div className="hidden lg:block">
                <span className="font-semibold text-gray-700">
                  {user?.displayName}
                </span>
                <ChevronDown size={20} className="text-gray-500 inline" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          {location.pathname === "/dashboard" && (
            <DashboardOverview myRecipes={myRecipes}></DashboardOverview>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
