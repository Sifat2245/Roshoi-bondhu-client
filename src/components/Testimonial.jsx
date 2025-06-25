import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";


const Testimonial = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetch("/testimonials.json")
      .then((res) => res.json())
      .then((data) => setTestimonials(data));
  }, []);

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            What Our Guests Are Saying
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover how Platea has created unforgettable moments and culinary
            delights for our cherished patrons.
          </p>
        </div>
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={{
              prevEl: ".custom-prev",
              nextEl: ".custom-next",
            }}
            pagination={{ clickable: true }}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            spaceBetween={50}
            slidesPerView={1}
            className="max-w-4xl mx-auto"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="bg-gray-50 rounded-lg shadow-lg p-8 md:p-12 text-center">
                  <div className="mb-6">
                      <RiDoubleQuotesL className="text-red-500 text-5xl mx-auto" />
                  </div>
                  <p className="text-gray-700 text-xl italic mb-8 max-w-2xl mx-auto">
                    {testimonial.message}
                  </p>
                  <div className="flex justify-center text-yellow-500 mb-6">
                    {Array.from({ length: testimonial.rating }).map(
                      (_, index) => (
                        <FaStar key={index} className="w-6 h-6" />
                      )
                    )}
                  </div>
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-md object-cover"
                  />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-red-600 font-medium">{testimonial.role}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Custom Navigation Buttons */}
          <div className="custom-prev absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-12">
            <button className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors duration-300">
              <FaChevronLeft className="text-gray-700 text-xl" />
            </button>
          </div>
          <div className="custom-next absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-12">
            <button className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors duration-300">
              <FaChevronRight className="text-gray-700 text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;