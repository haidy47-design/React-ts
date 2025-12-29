import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchReviews } from "../api";
import Spinner from "../../../components/common/Spinner";
// import HelmetWrapper from "../../../components/common/HelmetWrapper";

const AdminProductReviews: React.FC = () => {
  const { productID } = useParams<{ productID: string }>();

  const { data: reviews, isLoading, isError } = useQuery({
    queryKey: ["reviews", productID],
    queryFn: async () => {
      const all = await fetchReviews();
      return all.filter((r) => r.productID === productID);
    },
  });


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  
  const paginatedReviews = useMemo(() => {
    if (!reviews) return [];
    const start = (currentPage - 1) * itemsPerPage;
    return reviews.slice(start, start + itemsPerPage);
  }, [reviews, currentPage]);

  const totalPages = useMemo(() => {
    if (!reviews) return 0;
    return Math.ceil(reviews.length / itemsPerPage);
  }, [reviews]);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  if (isLoading) return <Spinner />;
  if (isError)
    return (
      <div className="text-danger text-center py-4">
        Error loading reviews.
      </div>
    );

  if (!reviews || reviews.length === 0)
    return (
      <div className="container mt-4 text-center text-muted py-4">
        <h5>No reviews found for this product.</h5>
        <Link to="/admin/products" className="btn btn-secondary mt-3">
          Back to Products
        </Link>
      </div>
    );

  return (
  <>
  {/* <HelmetWrapper title="Product Review" /> */}
      <div className="container-fluid px-2 px-sm-3 mt-3">
        <div className="d-flex flex-column flex-md-row justify-content-center justify-content-md-between align-items-start align-items-sm-center mb-3 mb-sm-4 gap-2 px-2 px-sm-0">
          <h3 className="main-color mb-0 ">Product Reviews</h3>
          <Link to="/admin/products" className="btn btn-outline-secondary btn-sm w-sm-auto mt-2">
            Back to Products
          </Link>
        </div>
    
      
        <div className="row g-3 g-sm-4 my-md-4">
          {paginatedReviews.map((rev) => (
            <div key={rev.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card shadow-sm border-0 h-100 review-card mt-2">
                <div className="card-body p-2 p-sm-3">
              
                  <div className="d-flex align-items-center mb-2">
                    <i className="fa-solid fa-user-circle fs-4 fs-sm-3 me-2 main-color"></i>
                    <div className="flex-grow-1 text-truncate">
                      <h6 className="mb-0 small">{rev.name}</h6>
                      <small className="main-color" style={{ fontSize: '0.75rem' }}>
                        {rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString()
                          : ""}
                      </small>
                    </div>
                  </div>
    
                  {/* --- Rating --- */}
                  <div className="mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`fa-solid fa-star me-1 ${
                          star <= rev.rate ? "text-warning" : "text-secondary"
                        }`}
                        style={{ fontSize: '0.875rem' }}
                      ></i>
                    ))}
                  </div>
    
        
                  <h6 className="fw-semibold small mb-1">{rev.reviewTitle}</h6>
                  <p className="main-color mb-0" style={{ fontSize: '0.813rem' }}>
                    {rev.overall}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
    
      
        {reviews.length > itemsPerPage && (
          <div className="pagination-bar d-flex justify-content-center align-items-center mt-4 gap-2 flex-wrap">
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={currentPage === 1}
              onClick={goToPreviousPage}
            >
              ‹ Prev
            </button>
    
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  className={`btn btn-sm ${
                    currentPage === pageNum ? "btn-success" : "btn-outline-secondary"
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
    
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={currentPage === totalPages}
              onClick={goToNextPage}
            >
              Next ›
            </button>
          </div>
        )}
      </div>
  </>
  );
};

export default AdminProductReviews;
