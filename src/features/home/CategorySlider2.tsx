import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Autoplay, Navigation, Pagination, EffectCoverflow } from "swiper/modules"; 
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow"; 
import "swiper/css/pagination";
import "../../styles/category2.css"; 

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

export default function CategorySlider2(): React.ReactElement {
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

  if (error) return <p className="text-center text-danger">Error loading categories. Please try again.</p>;

  const categories = Array.isArray(data) ? data : [];

  return (
    <section className="container py-5 position-relative">
      <h3 className="section-title text-center mb-2 mt-5">
         Discover Our Categories 
      </h3>
      <div className="mb-5 pb-1">
        <p className="text-center text-muted mt-3 mb-1">
          Fresh, Seasonal, Beautiful
        </p>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}

      {!isLoading && categories.length > 0 && (
        <Swiper
          modules={[Navigation, Autoplay, Pagination, EffectCoverflow]}
          effect={"coverflow"} 
          
          coverflowEffect={{
            rotate: 50, 
            stretch: 0, 
            depth: 100, 
            modifier: 1,
            slideShadows: true, 
          }}
          
          grabCursor={true} 
          centeredSlides={true} 
          slidesPerView={3} 
          spaceBetween={10} 
          loop
          navigation={true} 
          pagination={{ clickable: true }}
          autoplay={{ delay: 2500, disableOnInteraction: false }}

          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 10 },
            768: { slidesPerView: 2.5, spaceBetween: 15 }, 
            1200: { slidesPerView: 3, spaceBetween: 20 },
          }}
        >
          {categories.map((cat) => (
            <SwiperSlide key={cat.id}>
              <Link
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="category-card shadow-lg position-relative overflow-hidden" 
              >
                <div className="category-img-container"> 
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="category-img"
                  />
                </div>
                <div className="overlay"></div>
                <div className="card-info text-center position-absolute bottom-0 start-0 end-0 text-white p-3">
                  <h5 className="card-title mb-1 text-uppercase">{cat.name}</h5>
                  
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}