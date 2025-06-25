import { Link } from "react-router";
import { FaUsers, FaHeart, FaGlobeAsia } from "react-icons/fa";
import Navbar from "../components/Navbar";
import PopularTags from "../components/PopularTags";
import Footer from "../components/Footer";
import bg from "../assets/recipe-taxonomies-bg.svg";


const teamMembers = [
  {
    name: "Anika Rahman",
    role: "Founder & Head Chef",
    image: "https://placehold.co/400x400/f87171/ffffff?text=AR",
    bio: "A lifelong foodie, Anika started Roshoi Bondhu to share her passion for Bengali cuisine and connect kitchens across the globe.",
  },
  {
    name: "Fahim Chowdhury",
    role: "Lead Developer",
    image: "https://placehold.co/400x400/60a5fa/ffffff?text=FC",
    bio: "Fahim is the architectural genius behind our platform, ensuring a smooth, seamless, and delightful user experience.",
  },
  {
    name: "Sadia Islam",
    role: "Community Manager",
    image: "https://placehold.co/400x400/34d399/ffffff?text=SI",
    bio: 'Sadia cultivates our vibrant community, making sure every "Roshoi Bondhu" feels welcomed, heard, and inspired.',
  },
];

const AboutUs = () => {
  return (
    <>
      <Navbar></Navbar>
      <div className="bg-gray-50 font-sans">
        <div className="relative text-center py-28 px-4 bg-[#00000010] mt-6 dark:bg-gray-900">
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <p className="text-gray-700 mb-4 dark:text-white">
            Explore our passion for food and creativity. We craft inspiring
            recipes to bring people together, celebrate great <br /> meals, and
            make cooking a joyful experience.
          </p>

          <img
            src={bg}
            alt="Background Decoration"
            className="absolute top-72 lg:top-44"
          />
        </div>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-gray-700">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Our Story
                </h2>
                <p className="mb-4">
                  It all started in a small kitchen, with a handful of
                  cherished, handwritten recipe cards passed down through
                  generations. We realized that these recipes weren't just
                  instructions; they were stories, memories, and a tangible
                  piece of our heritage.
                </p>
                <p className="mb-4">
                  Worried that these precious culinary traditions could be lost
                  to time, we created{" "}
                  <span className="font-bold text-red-600">Roshoi Bondhu</span>.
                  It began as a personal project to digitize our family's
                  cooking and quickly grew into a global platform for food
                  lovers everywhere.
                </p>
                <p>
                  Today, we are a bustling hub where home cooks and professional
                  chefs alike come to find inspiration, share their creations,
                  and become a "Kitchen Friend" to someone new.
                </p>
              </div>
              <div>
                <img
                  src="https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=2070&auto=format&fit=crop"
                  alt="A person cooking in a beautiful kitchen"
                  className="rounded-lg shadow-2xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found";
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              What We Believe In
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12">
              Our platform is guided by a few core principles that ensure a rich
              and rewarding experience for everyone.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-8 border border-gray-200 rounded-lg hover:shadow-xl transition-shadow duration-300">
                <FaUsers className="text-5xl text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Community First
                </h3>
                <p className="text-gray-600">
                  We foster a supportive and friendly environment where everyone
                  is welcome to share and learn.
                </p>
              </div>

              <div className="p-8 border border-gray-200 rounded-lg hover:shadow-xl transition-shadow duration-300">
                <FaHeart className="text-5xl text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Authentic Flavors
                </h3>
                <p className="text-gray-600">
                  From grandmothers' secrets to modern twists, we celebrate the
                  true essence of cooking.
                </p>
              </div>

              <div className="p-8 border border-gray-200 rounded-lg hover:shadow-xl transition-shadow duration-300">
                <FaGlobeAsia className="text-5xl text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Endless Discovery
                </h3>
                <p className="text-gray-600">
                  Explore a world of cuisines and techniques right from your
                  kitchen, shared by cooks like you.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Meet the Faces Behind the Food
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12">
              We are a small, passionate team dedicated to making Roshoi Bondhu
              the best food community online.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="flex flex-col items-center text-center"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mb-4 shadow-lg object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/128x128/cccccc/ffffff?text=Image";
                    }}
                  />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-red-600 font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600 max-w-xs">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-red-600 py-16">
          <div className="container mx-auto px-6 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Join Our Kitchen?
            </h2>
            <p className="text-lg text-red-100 mb-8 max-w-2xl mx-auto">
              Share your first recipe or discover your next favorite meal today.
              Your next kitchen adventure awaits!
            </p>
            <Link
              to="/all-recipes"
              className="bg-white text-red-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-red-100 transition-colors duration-300 shadow-lg inline-block"
            >
              Explore Recipes
            </Link>
          </div>
        </section>
      </div>
      <PopularTags></PopularTags>
      <Footer></Footer>
    </>
  );
};

export default AboutUs;
