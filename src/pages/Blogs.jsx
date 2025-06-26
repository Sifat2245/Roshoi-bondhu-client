import React from "react";
import bg from "../assets/recipe-taxonomies-bg.svg";
import Navbar from "../components/Navbar";
import PopularTags from "../components/PopularTags";
import Footer from "../components/Footer";
import { Clock, User } from "lucide-react";

const blogPosts = [
  {
    image: "https://i.ibb.co/Lhn8w7Sr/post-5-800x520.jpg",
    category: "Health",
    title: "Power Up Your Mornings: 5 Quick and Healthy Breakfast Ideas",
    author: "Olivia Thompson",
    date: "6 months ago",
    readTime: "5 min read",
  },
  {
    image: "https://i.ibb.co/C5zn9s6m/post-6-800x520.jpg",
    category: "Spotlights",
    title: "Master Knife Skills for Effortless Cooking Prep",
    author: "Olivia Thompson",
    date: "6 months ago",
    readTime: "4 min read",
  },
  {
    image: "https://i.ibb.co/Q7CcRjQh/post-7-800x520.jpg",
    category: "Collections",
    title: "Savor Every Bite: A Celebration of Pizza Moments",
    author: "Olivia Thompson",
    date: "6 months ago",
    readTime: "4 min read",
  },
  {
    image: "https://i.ibb.co/B2Z0Z6gT/post-1-800x520.jpg",
    category: "Tips",
    title: "Quick and Tasty Stir-Fry Recipes for Busy Evenings",
    author: "Chris Green",
    date: "7 months ago",
    readTime: "6 min read",
  },
  {
    image: "https://i.ibb.co/PsrHPSmK/post-2-800x520.jpg",
    category: "Spotlights",
    title: "Create Lasting Memories Around the Family Table",
    author: "Jessica Blue",
    date: "8 months ago",
    readTime: "5 min read",
  },
  {
    image: "https://i.ibb.co/GBzJ4JK/post-3-800x520.jpg",
    category: "Ingredients",
    title: "One-Pot Wonders to Simplify Your Weeknight Meals",
    author: "John Smith",
    date: "8 months ago",
    readTime: "7 min read",
  },
];

const BlogCard = ({ post }) => {
  return (
    <div className=" dark:bg-gray-700 dark:text-white rounded-xl overflow-hidden transition-all duration-300 group">
      <div className="relative">
        <img
          className="h-72 rounded-2xl w-full object-cover"
          src={post.image}
          alt={`Featured image for ${post.title}`}
        />
        <span className="absolute top-3 left-3 inline-block bg-[#e02f21] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
          {post.category}
        </span>
      </div>

      <div className="p-4">
        <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#e02f21] transition-colors cursor-pointer">
          {post.title}
        </h3>

        <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <User className="w-4 h-4 mr-1" />
          <span>
            by <span className="font-medium">{post.author}</span>
          </span>
          <span className="mx-2">|</span>
          <Clock className="w-4 h-4 mr-1" />
          <span>{post.date}</span>
          <span className="mx-2">|</span>
          <span>{post.readTime}</span>
        </div>
      </div>
    </div>
  );
};

const Blogs = () => {
  return (
    <div className="dark:bg-gray-800 dark:text-white transition-all duration-400">
      <Navbar></Navbar>
      <div className="relative text-center py-28 px-4 bg-[#00000010] mt-6 dark:bg-gray-900 dark:text-white transition-all duration-400 ">
        <h1 className="text-4xl font-bold mb-4">Blogs</h1>
        <p className="text-gray-700 mb-4 dark:text-white">
          Explore a wide range of recipes in each category, from appetizers to
          desserts, catering to all tastes and dietary <br /> needs. Find your
          next meal inspiration today!
        </p>
        <img
          src={bg}
          alt="Background Decoration"
          className="absolute top-86 lg:top-46"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <BlogCard key={index} post={post} />
          ))}
        </div>
      </div>

      <PopularTags></PopularTags>
      <Footer></Footer>
    </div>
  );
};

export default Blogs;
