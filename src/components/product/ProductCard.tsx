import React, { memo } from "react";
import { Link } from "react-router-dom";

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  discount?:number;
  quantity?:number
};

type Props = {
  product: Product;
};

function ProductCardComponent({ product }: Props): React.ReactElement {

  const hasDiscount = true;
  const discountedPrice = (product.price * 0.9).toFixed(2);
  const originalPrice = product.price.toFixed(2);

  return (
    
    <div className=" border-0  position-relative overflow-hidden product-card mb-3"
    style={{ 
        backgroundColor: 'transparent',
        borderRadius: '0px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-20px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
  
      {hasDiscount && (
          <div className="bg-main-color px-2 text-white" style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
          }}>
            VDAY 10% Off
          </div>
      )}

      {/* صورة المنتج */}
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div >
        <img
          src={product.image}
          alt={product.title}
          style={{height:"500px"}}
          className="card-img-top object-fit-cover"
          loading="lazy"
        />
      </div>
      </Link>

      {/* تفاصيل المنتج */}
      <div className=" text-center">
        <h5 className=" mt-3 mb-2 ">
          {product.title}
        </h5>

        {/* السعر */}
        <div>
          {hasDiscount ? (
            <>
              <span className="fw-bold main-color me-2">
                ${discountedPrice}
              </span>
              <span className="text-muted text-decoration-line-through small">
                ${originalPrice}
              </span>
            </>
          ) : (
            <span className="fw-bold">${originalPrice}</span>
          )}
        </div>

      
      </div>
    </div>
  );
}

const ProductCard = memo(ProductCardComponent);
export default ProductCard;