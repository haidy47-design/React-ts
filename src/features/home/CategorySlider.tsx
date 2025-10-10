//   import React from "react";
// import { useQuery } from "@tanstack/react-query";
// import axiosInstance from "../../app/axiosInstance";
// import Spinner from "../../components/common/Spinner";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay, Navigation } from "swiper/modules";

// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import "../../styles/home.css";

// // ==========================
// // Interfaces
// // ==========================
// interface Product {
//   id: string;
//   title: string;
//   price: number;
//   category: string;
//   description: string;
//   image: string;
//   stock: number;
// }

// interface Category {
//   id: string;
//   name: string;
//   image: string;
//   count: number;
// }

// // ==========================
// // Component
// // ==========================
// export default function CategorySlider(): React.ReactElement {
//   // Fetch categories using React Query
//   const { data: categories = [], isLoading, error } = useQuery<Category[]>({
//   queryKey: ["categories"],
//   queryFn: async () => {
//     const response = await axiosInstance.get<Product[]>(
//       "https://68e43ee28e116898997b5bf8.mockapi.io/product"
//     );

//     const categoryMap = new Map<string, { image: string; count: number }>();

//     response.data.forEach((product) => {
//       if (categoryMap.has(product.category)) {
//         const existing = categoryMap.get(product.category)!;
//         existing.count += 1;
//       } else {
//         categoryMap.set(product.category, {
//           image: product.image,
//           count: 1,
//         });
//       }
//     });

//     return Array.from(categoryMap.entries()).map(([name, data], index) => ({
//       id: (index + 1).toString(),
//       name,
//       image: data.image,
//       count: data.count,
//     }));
//   },
//   staleTime: 5 * 60 * 1000,
//     retry: 2,
// });

    
  
  

//   // ==========================
//   // Handlers
//   // ==========================
//   const handleCategoryClick = (categoryName: string): void => {
//     console.log(`Category clicked: ${categoryName}`);
//   };

//   // ==========================
//   // Render
//   // ==========================

  
// console.log("Categories in render:", categories);

//   return (
//     <section className="container py-6 position-relative text-center">
//       <h3 className="section-title text-center mb-2 mt-5">
//         Discover Our Categories
//       </h3>
//       <div className="mb-5 pb-1">
//       <h6 className="text-center mt-3 ">Fresh, Seasonal, Beautiful</h6>
//       <h6 className="text-center mb-5">Order Now and Get Same-Day-Delivery</h6>
//       </div>

//       {/* Spinner Overlay */}
//       {isLoading && (
//         <div
//           className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
//           style={{
//             background: "rgba(255,255,255,0.7)",
//             zIndex: 10,
//             borderRadius: "10px",
//           }}
//         >
//           <Spinner />
//         </div>
//       )}

//       {/* Error message */}
//       {error && (
//         <div className="alert alert-warning text-center" role="alert">
//           Error loading categories. Please try again later.
//         </div>
//       )}

//       {/* Swiper Carousel */}
//       {!isLoading && Array.isArray(categories) && categories.length > 0 && (
//         <Swiper
//           modules={[Autoplay, Navigation]}
//           slidesPerView={4}
//           spaceBetween={20}
//           loop={true}
//           navigation
//           autoplay={{
//             delay: 2500,
//             disableOnInteraction: false,
//           }}
//           speed={800}
//           breakpoints={{
//             320: { slidesPerView: 1 },
//             576: { slidesPerView: 2 },
//             992: { slidesPerView: 3 },
//             1200: { slidesPerView: 4 },
//           }}
//         >
//           {categories.map((category) => (
//             <SwiperSlide key={category.id}>
//               <div
//                 className="card h-100 shadow-sm category-card"
//                 style={{ cursor: "pointer" }}
//                 onClick={() => handleCategoryClick(category.name)}
//               >
//                 <div
//                   className="card-img-top-container"
//                   style={{ height: "200px", overflow: "hidden" }}
//                 >
//                   <img
//                     src={category.image}
//                     alt={category.name}
//                     className="card-img-top h-100 w-100 object-fit-cover"
//                     style={{ transition: "transform 0.3s ease" }}
//                     onMouseEnter={(e) =>
//                       (e.currentTarget.style.transform = "scale(1.05)")
//                     }
//                     onMouseLeave={(e) =>
//                       (e.currentTarget.style.transform = "scale(1)")
//                     }
//                   />
//                 </div>
//                 <div className="card-body text-center">
//                   <h5 className="card-title mb-1">{category.name}</h5>
//                   <small className="text-muted">
//                     {category.count} products
//                   </small>
//                 </div>
//               </div>
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       )}
      
//     </section>

    
//   );
// }


import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
  stock: number;
}

interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
}

export default function CategorySlider(): React.ReactElement {
  const { data, isLoading, error } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axios.get<Product[]>(
        "https://68e43ee28e116898997b5bf8.mockapi.io/product"
      );

      const categoryMap = new Map<string, { image: string; count: number }>();

      response.data.forEach((product) => {
        if (categoryMap.has(product.category)) {
          const existing = categoryMap.get(product.category)!;
          existing.count += 1;
        } else {
          categoryMap.set(product.category, {
            image: product.image,
            count: 1,
          });
        }
      });

      return Array.from(categoryMap.entries()).map(([name, data], index) => ({
        id: (index + 1).toString(),
        name,
        image: data.image,
        count: data.count,
      }));
    },
  });

  if (error) return <p className="text-center">Error loading categories</p>;

  const categories = Array.isArray(data) ? data : [];

  return (
    <section className="container py-5 position-relative">
      <h3 className="section-title text-center mb-2 mt-5">
        Discover Our Categories
       </h3>
      <div className="mb-5 pb-1">
       <h6 className="text-center mt-3 ">Fresh, Seasonal, Beautiful</h6>
      <h6 className="text-center mb-5">Order Now and Get Same-Day-Delivery</h6>
       </div>

      {/* Spinner overlay */}
      {isLoading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.7)",
            zIndex: 10,
          }}
        >
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}

      {/* Swiper only when data ready */}
      {!isLoading && categories.length > 0 && (
        <Swiper
          modules={[Navigation, Autoplay]}
          slidesPerView={4}
          spaceBetween={20}
          loop
          navigation
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          breakpoints={{
            320: { slidesPerView: 1 },
            576: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
        >
          {categories.map((cat) => (
            <SwiperSlide key={cat.id} >
              <div
                className="card shadow-sm h-150 position-relative overflow-hidden category-card"
                style={{ cursor: "pointer", width: "100%" }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="category-img"
                />
                {/* Overlay gradient */}
                <div className="overlay"></div>

                {/* Card text */}
                <div className="card-body text-center position-absolute bottom-0 start-0 end-0 text-white">
                  <h5 className="card-title mb-1">{cat.name}</h5>
                  <small>{cat.count} products</small>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Custom styles */}
      <style>{`
        .category-card {
          border-radius: 12px;
          overflow: hidden;
        }
        .category-img {
          width: 100%;
          height: 300px;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6));
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .category-card:hover .category-img {
          transform: scale(1.1);
        }
        .category-card:hover .overlay {
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
