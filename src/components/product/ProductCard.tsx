import React, { memo } from "react";
import { Link } from "react-router-dom";

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  discount?: number;
};

type Props = {
  product: Product;
};

// Product summary card used in grids
function ProductCardComponent({ product }: Props): React.ReactElement {
  return (
    <div className="card h-100 shadow-sm border-0">
      <img src={product.image} className="card-img-top object-fit-cover" alt={product.title} style={{ height: 220 }} />
      <div className="card-body">
        <h6 className="card-title text-truncate">{product.title}</h6>
        <p className="card-text small text-muted text-truncate-2">{product.description}</p>
        <div className="d-flex justify-content-between align-items-center">
          <strong>${product.price.toFixed(2)}</strong>
          <Link to={`/products/${product.id}`} className="btn btn-sm btn-outline-primary">Details</Link>
        </div>
      </div>
    </div>
  );
}

const ProductCard = memo(ProductCardComponent);
export default ProductCard;


