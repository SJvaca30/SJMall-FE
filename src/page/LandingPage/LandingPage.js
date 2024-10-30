import React, { useEffect } from "react";
import ProductCard from "./components/ProductCard";
import { Row, Col, Container } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProductList } from "../../features/product/productSlice";
import "./style/landing.style.css";

const LandingPage = () => {
  const dispatch = useDispatch();
  const { productList, loading } = useSelector((state) => state.product) || [];
  const [query] = useSearchParams();
  const name = query.get("name");

  useEffect(() => {
    dispatch(getProductList({ name }));
  }, [query, dispatch]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="landing-container">
      <Container>
        <h1 className="main-title">SJ MALL</h1>
        <p className="sub-title">트렌디한 패션 아이템을 만나보세요</p>
        
        <Row className="product-grid">
          {productList?.length > 0 ? (
            productList.map((item) => (
              <Col md={3} sm={6} xs={12} key={item._id} className="product-col">
                <ProductCard item={item} />
              </Col>
            ))
          ) : (
            <div className="empty-state">
              {name === "" ? (
                <>
                  <img src="/empty-box.svg" alt="empty" className="empty-icon" />
                  <h2>등록된 상품이 없습니다!</h2>
                </>
              ) : (
                <>
                  <img src="/search-empty.svg" alt="no results" className="empty-icon" />
                  <h2>'{name}'과 일치하는 상품이 없습니다!</h2>
                </>
              )}
            </div>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default LandingPage;
