import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Spinner from "../../components/common/Spinner";
import ProductCard, { Product } from "../../components/product/ProductCard";
import HelmetWrapper from "../../components/common/HelmetWrapper";
import "./CartPage.css"; 

async function fetchProducts(): Promise<Product[]> {
  const res = await axios.get("https://68e43ee28e116898997b5bf8.mockapi.io/product");
  return res.data;
}

export default function ProductsPage(): React.ReactElement {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortOption, setSortOption] = useState<string>("default");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const products = useMemo(() => data ?? [], [data]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).sort();
    return ["All", ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm.trim() !== "") {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (sortOption === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === "title-asc") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setCurrentPage(1);
    return result;
  }, [products, searchTerm, selectedCategory, sortOption]);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="container py-5 products-page">
      <HelmetWrapper title="Beautiful Flowers" />

      <div className="text-center mb-5">
        <h2 className="fw-bold">Beautiful Flowers</h2>
        <p className="text-muted">
          Discover our collection of fresh and elegant flower bouquets perfect for every occasion.
        </p>
      </div>

      
      <div className="row mb-4">
        <div className="col-12">
          <div className="filters-bar d-flex flex-wrap gap-4 align-items-center justify-content-center justify-content-md-start mb-4">
            <div className="filter-item">
              <label htmlFor="searchInput" className="form-label mb-1">
                Search by name:
              </label>
              <input
                id="searchInput"
                type="text"
                placeholder="Search flowers..."
                className="form-control rounded-0 border-top-0 border-start-0 border-end-0 border-2"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-item">
              <label htmlFor="categorySelect" className="form-label mb-1">
                Category:
              </label>
              <select
                id="categorySelect"
                className="form-select custom-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="sortSelect" className="form-label mb-1">
                Sort by:
              </label>
              <select
                id="sortSelect"
                className="form-select custom-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="title-asc">Name</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="d-flex justify-content-center my-5">
          <Spinner />
        </div>
      )}

     
      {isError && (
        <div className="alert alert-danger text-center">
          Failed to load products. Please try again.
        </div>
      )}

     
      {!isLoading && !isError && (
        <>
          <div className="row g-4">
            {currentProducts.length > 0 ? (
              currentProducts.map((p) => (
                <div key={p.id} className="col-12 col-md-6 col-lg-4">
                  <ProductCard product={p} />
                </div>
              ))
            ) : (
              <div className="text-center py-5 text-muted">
                No products found for this category.
              </div>
            )}
          </div>

         
          {filteredProducts.length > itemsPerPage && (
            <div className="pagination-bar d-flex justify-content-center align-items-center mt-5">
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                disabled={currentPage === 1}
                onClick={goToPreviousPage}
              >
                Previous
              </button>
              <span className="fw-bold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-sm btn-outline-success ms-2"
                disabled={currentPage === totalPages}
                onClick={goToNextPage}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
