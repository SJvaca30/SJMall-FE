import React from "react";
import { useNavigate } from "react-router-dom";
import { currencyFormat } from "../../../utils/number";
import "./ProductCard.css";

const ProductCard = ({ item }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="product-card" 
      onClick={() => navigate(`/product/${item._id}`)}
    >
      <div className="product-image-container">
        <img src={item.image} alt={item.name} className="product-image" />
        {item.status === "NEW" && <span className="status-badge">NEW</span>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{item.name}</h3>
        <p className="product-price">₩ {currencyFormat(item.price)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
