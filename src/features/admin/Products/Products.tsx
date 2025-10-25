import React, { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner, Form, Button, Card, Row, Col, Container } from "react-bootstrap";
import { useNavigate } from "react-router";
import "./AdProduct.css";
import { applyDiscountForAllProducts, deleteProduct, fetchProducts } from "../api";
import { Product } from "src/components/product/ProductCard";
import { showConfirmAlert, showDiscountPrompt, showErrorAlert, showSuccessAlert } from "../../../components/common/CustomSwal";

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showSuccessAlert("Product deleted successfully");
    },
  });

const applyDiscountMutation = useMutation({
  mutationFn: (discount: number) => applyDiscountForAllProducts(discount),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    showSuccessAlert("Discount applied to all products successfully");
  },
  onError: (error) => {
    console.error("Discount API Error:", error);
    showErrorAlert("Failed to apply discount!");
  },
});
;


  const { data, isLoading, isError } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("All"); // ? ???? ?????? ??????

  const itemsPerPage = 6;

  const products = useMemo(() => data ?? [], [data]);

   const minAvailablePrice = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.min(...data.map((p) => Number(p.price)));
  }, [data]);

  
  const maxAvailablePrice = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map((p) => Number(p.price)));
  }, [data]);


  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).sort();
    return ["All", ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!data) return [];
    return data.filter((p) => {
      const matchesSearch =
        (p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.id?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false;

      const matchesCategory =
        !category || category === "All" || p.category?.toLowerCase() === category.toLowerCase();

      const matchesPrice = !maxPrice || Number(p.price) <= Number(maxPrice);

      // ? ????? ?????? ????? ??? ???????
      let stockStatus = "Active";
      if (p.stock === 0) stockStatus = "Out of Stock";
      else if (p.stock <= 3) stockStatus = "Low Stock";

      const matchesStatus = statusFilter === "All" || statusFilter === stockStatus;

      return matchesSearch && matchesCategory && matchesPrice && matchesStatus;
    });
  }, [data, searchTerm, category, maxPrice, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleReset = () => {
    setSearchTerm("");
    setCategory("");
    setMaxPrice(0);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmAlert("Are you sure you want to delete this product?");
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };



  
  const handleGlobalDiscount = async () => {
  const discount = await showDiscountPrompt(); 
  if (discount === null) return;

  const confirmed = await showConfirmAlert(
    `Apply ${discount}% discount to all products?`
  );
  if (!confirmed) return;

  await applyDiscountMutation.mutateAsync(discount);
};



  if (isLoading)
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" />
      </div>
    );

  if (isError)
    return (
      <div className="text-center text-danger mt-4">
        Failed to load products ??
      </div>
    );

  return (
    <div>
      {/* ?? Filters Section */}
      <div className="p-4 bg-white rounded-4 shadow-sm mb-4">
        <div className="d-md-flex justify-content-between d-flex-column ">
          <h4 className="fw-bold mb-4" style={{ color: "#79253D" }}>
            Product Management
          </h4>

          <div className="btn-group col-12 col-md-auto mb-4 mb-md-0 d-flex flex-wrap">
            <button className="btn btn-success fs-5 mb-4 mb-md-2 " onClick={() => navigate("/admin/products/add")}>
              Add Product
            </button>
            
             <button
               className="btn btn-warning text-white fs-5  mb-4 mb-md-2 "
               onClick={handleGlobalDiscount}
             >
               Add Discount for All
             </button>
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3 ">
          <input
            type="text"
            placeholder="Search by name or id"
            style={{ width: "250px" ,height:"2.3rem"}}
            className=" form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Form.Select
            style={{
              width: "200px",
              backgroundColor: "#FDFBF8",
              border: "1px solid #79253D",
              color: "#79253D",
            }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>

                
          <Form.Select
            style={{
              width: "200px",
              backgroundColor: "#FDFBF8",
              border: "1px solid #79253D",
              color: "#79253D",
            }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </Form.Select>

      
          <div className="d-flex align-items-center gap-2">
            <span className="main-color">
              Max Price: ${maxPrice || maxAvailablePrice}
            </span>
            <Form.Range
              min={minAvailablePrice}
              max={maxAvailablePrice}
              className="custom-range"
              value={maxPrice || maxAvailablePrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{
                width: "200px",
                accentColor: "#79253D",
              }}
            />
          </div>

          <Button variant="outline-secondary" className="ms-auto col-12 col-md-2 col-lg-1 px-0" onClick={handleReset}>
            Reset Filters
          </Button>
        </div>
      </div>

    
      <div className="table-responsive mt-4 bg-white rounded-4 shadow-sm d-none d-lg-block">
        <table className="table align-middle table-hover">
          <tr style={{ backgroundColor: "#79253D", color: "white" }}>
            <th className="p-3">Product Info</th>
            <th className="p-3">Category</th>
            <th className="p-3">Price</th>
            <th className="p-3">Net Price</th>
            <th className="p-3">Quantity</th>
            <th className="p-3 ps-4">Status</th>
            <th className="p-3">Actions</th>
          </tr>

          {currentProducts.map((product) => (
            <tr key={product.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td className="bg-transparent p-3">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <p className="mb-0">{product.title}</p>
                    <span className="text-muted">SKU: {product.id}</span>
                  </div>
                </div>
              </td>
              <td className="ps-4">{product.category}</td>
              <td className="ps-4">${product.price}</td>
              <td className="ps-4">${product.discount}</td>
              <td className="ps-5">{product.stock}</td>

              <td >
                {product.stock === 0 ? (
                  <span className="badge bg-danger text-white w-75">Out of Stock</span>
                ) : product.stock <= 3 ? (
                  <span className="badge bg-warning text-white w-75">Low Stock</span>
                ) : (
                  <span className="badge w-75" style={{backgroundColor:"#24a167ff" ,color:"white"}}>Active</span>
                )}
              </td>


              <td>
                <div className="d-flex bg-transparent">
                  <button className="btn btn-emojiShow btn-sm" onClick={() => navigate(`/admin/reviews/${product.id}`)}>
                      <i className="fa-solid fa-eye m-1" />
                    </button>
                  <button className="btn btn-emojiShow btn-sm" onClick={() => navigate(`/admin/products/edit/${product.id}`)}>
                    <i className="fa-solid fa-pen-to-square m-1"></i>
                  </button>
                  <button
                    className="btn btn-emojiDelete btn-sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(product.id)}
                  >
                    {deleteMutation.isPending ? (
                      <i className="fa-solid fa-spinner fa-spin m-1" />
                    ) : (
                      <i className="fa-solid fa-trash m-1" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </table>

        {!currentProducts.length && (
          <div className="text-center text-muted py-5">No products found</div>
        )}
      </div>

      {/* ?? Card View - Mobile & Tablet (hidden on desktop) */}
      <div className="d-lg-none mt-4">
        <Row className="g-3">
          {currentProducts.map((product) => (
            <Col xs={12} sm={6} key={product.id}>
              <Card className="shadow-sm h-100">
                <Card.Img 
                  variant="top" 
                  src={product.image} 
                  alt={product.title}
                  style={{ 
                    height: "300px", 
                    objectFit: "cover" 
                  }}
                />
                <Card.Body>
                  <Card.Title className="fs-6 fw-bold text-truncate text-center">
                    {product.title}
                  </Card.Title>
                  <Card.Text className="small text-muted mb-2">
                    SKU: {product.id}
                  </Card.Text>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small">
                      Price: ${product.price}
                    </span>
                    <span className="small">
                      Net Price: ${product.discount}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <span className="small">
                    Quantity: {product.stock}
                    </span>
                  </div>
                  <div className="mb-3">
                    {product.stock === 0 ? (
                  <span className="badge bg-danger text-white ">Out of Stock</span>
                ) : product.stock <= 3 ? (
                  <span className="badge bg-warning text-white ">Low Stock</span>
                ) : (
                  <span className="badge " style={{backgroundColor:"#24a167ff" ,color:"white"}}>Active</span>
                )}
                  </div>

                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-success py-2" 
                      size="sm" 
                      className="flex-grow-1"
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                    >
                      <i className="fa-solid fa-pen-to-square me-1"></i>
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="flex-grow-1"
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDelete(product.id)}
                    >
                      {deleteMutation.isPending ? (
                        <i className="fa-solid fa-spinner fa-spin" />
                      ) : (
                        <>
                          <i className="fa-solid fa-trash me-1"></i>
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {!currentProducts.length && (
          <div className="text-center text-muted py-5 bg-white rounded-4">
            No products found
          </div>
        )}
      </div>

      {/* ?? Pagination Section */}
      {filteredProducts.length > itemsPerPage && (
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
  );
};



export default ProductList;









