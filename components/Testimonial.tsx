"use client";

import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatarUrl: string;
  rating: number;
}

export default function TestimonialCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonialsData = [
    {
      id: "t2",
      name: "John Doe",
      role: "Digital Marketer",
      quote:
        "Integrating the Facebook Webhook was surprisingly smooth. My engagement rates have doubled.",
      avatarUrl: "/images/testimonials/john.jpg",
      rating: 4,
    },
    {
      id: "t3",
      name: "Sophia Martinez",
      role: "Customer Success Manager",
      quote:
        "We no longer miss a single customer inquiry. The bot’s quick responses keep our clients happy.",
      avatarUrl: "/images/testimonials/sophia.jpg",
      rating: 5,
    },
    {
      id: "t4",
      name: "Liam Chen",
      role: "Small Business Owner",
      quote:
        "I’m not technical, but configuring my bot was easier than setting up my Facebook page.",
      avatarUrl: "/images/testimonials/liam.jpg",
      rating: 5,
    },
    {
      id: "t5",
      name: "Emily Parker",
      role: "Content Creator",
      quote:
        "The training prompt feature helped me automate replies exactly how I want. My followers love it.",
      avatarUrl: "/images/testimonials/emily.jpg",
      rating: 4,
    },
    {
      id: "t6",
      name: "Rajesh Kumar",
      role: "Tech Consultant",
      quote:
        "Real-time analytics and token tracking are a game changer for optimizing bot performance.",
      avatarUrl: "/images/testimonials/rajesh.jpg",
      rating: 5,
    },
  ];

  // Fetch testimonials from API
  //   useEffect(() => {
  //     axios
  //       .get("/api/v1/testimonials")
  //       .then((res) => setTestimonials(res.data))
  //       .catch((err) => console.error("Failed to fetch testimonials", err));
  //   }, []);

  // Auto-slide
  useEffect(() => {
    setTestimonials(testimonialsData);
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // change every 5s
    return () => clearInterval(interval);
  }, []);

  if (testimonials.length === 0) {
    return <p className="text-center text-gray-500">Loading testimonials...</p>;
  }

  const goPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const { name, role, quote, avatarUrl, rating } = testimonials[currentIndex];

  return (
    <section className="py-16 ">
      <div className="max-w-4xl mx-auto px-4 relative">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent  animate-fadeIn">
          What Our Users Say
        </h2>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all duration-500">
          <div className="flex flex-col items-center text-center">
            <img
              src={avatarUrl}
              alt={name}
              className="w-20 h-20 rounded-full object-cover border-4 border-indigo-500 mb-4"
            />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>

            {/* Rating */}
            <div className="flex mt-2 mb-4">
              {Array.from({ length: rating }).map((_, i) => (
                <FaStar key={i} className="text-yellow-400" />
              ))}
            </div>

            {/* Quote */}
            <p className="text-gray-700 dark:text-gray-300 italic">“{quote}”</p>
          </div>
        </div>

        {/* Controls */}
        <button
          onClick={goPrev}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <IoChevronBack size={24} />
        </button>
        <button
          onClick={goNext}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <IoChevronForward size={24} />
        </button>
      </div>
    </section>
  );
}
