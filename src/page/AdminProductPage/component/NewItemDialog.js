import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { SIZE, STATUS } from "../../../constants/product.constants";
import {
  clearError,
  createProduct,
  deleteCategory,
  editProduct,
  getCategories,
  putCategories,
} from "../../../features/product/productSlice";
import CloudinaryUploadWidget from "../../../utils/CloudinaryUploadWidget";
import "../style/adminProduct.style.css";

const InitialFormData = {
  name: "",
  sku: "",
  stock: {},
  image: "",
  description: "",
  category: [],
  status: "active",
  price: 0,
};

const NewItemDialog = ({ mode, showDialog, setShowDialog }) => {
  const { error, success, selectedProduct, categories, categoryLoading } =
    useSelector((state) => state.product);
  const [formData, setFormData] = useState(
    mode === "new" ? { ...InitialFormData } : selectedProduct
  );
  const [stock, setStock] = useState([]);
  const dispatch = useDispatch();
  const [stockError, setStockError] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [categoryError, setCategoryError] = useState(false);

  const [addCategory, setAddCategory] = useState("");

  useEffect(() => {
    console.log("success : ", success);
    if (success) {
      setShowDialog(false);
    }
  }, [success]);

  useEffect(() => {
    setAddCategory("");
    dispatch(getCategories());
  }, [categoryLoading]);

  useEffect(() => {
    if (error || !success) {
      dispatch(clearError());
    }
    if (showDialog) {
      if (mode === "edit") {
        setFormData(selectedProduct);
        // 객체형태로 온 stock을  다시 배열로 세팅해주기
        const sizeArray = Object.keys(selectedProduct.stock).map((size) => [
          size,
          selectedProduct.stock[size],
        ]);
        setStock(sizeArray);
      } else {
        setFormData({ ...InitialFormData });
        setStock([]);
      }
    }
  }, [showDialog]);

  const handleClose = () => {
    //모든걸 초기화시키고;
    // 다이얼로그 닫아주기
    setStockError(false);
    setPriceError(false);
    setCategoryError(false);
    setFormData({ ...InitialFormData });
    setStock([]);
    setAddCategory("");
    setShowDialog(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStockError(false);
    setPriceError(false);
    setCategoryError(false);

    //재고를 입력했는지 확인, 아니면 에러
    if (stock.length === 0) {
      return setStockError(true);
    }

    if (formData.price <= 0) {
      return setPriceError(true);
    }

    if (formData.category.length === 0) {
      return setCategoryError(true);
    }

    // 재고를 배열에서 객체로 바꿔주기
    // [['M',2]] 에서 {M:2}로
    const totalStock = stock.reduce((total, item) => {
      return { ...total, [item[0]]: parseInt(item[1]) };
    }, {});

    if (mode === "new") {
      //새 상품 만들기
      dispatch(createProduct({ ...formData, stock: totalStock }));
    } else {
      // 상품 수정하기
      dispatch(
        editProduct({ id: selectedProduct._id, ...formData, stock: totalStock })
      );
    }
  };

  const handleChange = (event) => {
    const { id, value } = event.target;

    //form에 데이터 넣어주기
    setFormData({
      ...formData, // ... 비구조화 할당
      [id]: value,
    });
  };

  const addStock = () => {
    //재고타입 추가시 배열에 새 배열 추가
    setStock([...stock, []]);
  };

  const deleteStock = (idx) => {
    //재고 삭제하기
    const newStock = stock.filter((item, index) => index !== idx);
    setStock(newStock);
  };

  const handleSizeChange = (value, index) => {
    //  재고 사이즈 변환하기
    const newStock = [...stock];
    newStock[index][0] = value;

    setStock(newStock);
  };

  const handleStockChange = (value, index) => {
    //재고 수량 변환하기
    const newStock = [...stock];
    newStock[index][1] = value;

    setStock(newStock);
  };

  const onHandleCategory = (event) => {
    if (formData.category.includes(event.target.value)) {
      const newCategory = formData.category.filter(
        (item) => item !== event.target.value
      );
      setFormData({
        ...formData,
        category: [...newCategory],
      });
    } else {
      setFormData({
        ...formData,
        category: [...formData.category, event.target.value],
      });
    }
  };

  const uploadImage = (url) => {
    //이미지 업로드
    setFormData({
      ...formData,
      image: url,
    });
  };

  const handleAddCategory = (event) => {
    setAddCategory(event.target.value);
  };

  const submitNewCategory = () => {
    // 새로운 카테고리 추가
    dispatch(putCategories({ category: addCategory }));
  };

  const handleDeleteCategory = (id) => {
    dispatch(deleteCategory({ id: id }));
  };

  return (
    <Modal show={showDialog} onHide={handleClose}>
      <Modal.Header closeButton>
        {mode === "new" ? (
          <Modal.Title>Create New Product</Modal.Title>
        ) : (
          <Modal.Title>Edit Product</Modal.Title>
        )}
      </Modal.Header>
      {error && (
        <div className="error-message">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}
      <Form className="form-container" onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="sku">
            <Form.Label>Sku</Form.Label>
            <Form.Control
              onChange={handleChange}
              type="string"
              placeholder="Enter Sku"
              required
              value={formData.sku}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              onChange={handleChange}
              type="string"
              placeholder="Name"
              required
              value={formData.name}
            />
          </Form.Group>
        </Row>

        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="string"
            placeholder="Description"
            as="textarea"
            onChange={handleChange}
            rows={3}
            value={formData.description}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="stock">
          <Form.Label className="mr-1">Stock</Form.Label>
          {stockError && (
            <span className="error-message">Please add stock</span>
          )}
          <Button size="sm" onClick={addStock}>
            Add +
          </Button>
          <div className="mt-2">
            {stock.map((item, index) => (
              <Row key={index}>
                <Col sm={4}>
                  <Form.Select
                    onChange={(event) =>
                      handleSizeChange(event.target.value, index)
                    }
                    required
                    defaultValue={item[0] ? item[0].toLowerCase() : ""}
                  >
                    <option value="" disabled selected hidden>
                      Please Choose...
                    </option>
                    {SIZE.map((item, index) => (
                      <option
                        inValid={true}
                        value={item.toLowerCase()}
                        disabled={stock.some(
                          (size) => size[0] === item.toLowerCase()
                        )}
                        key={index}
                      >
                        {item}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col sm={6}>
                  <Form.Control
                    onChange={(event) =>
                      handleStockChange(event.target.value, index)
                    }
                    type="number"
                    placeholder="number of stock"
                    value={item[1]}
                    required
                  />
                </Col>
                <Col sm={2}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteStock(index)}
                  >
                    -
                  </Button>
                </Col>
              </Row>
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-3" controlId="Image" required>
          <Form.Label>Image</Form.Label>
          <CloudinaryUploadWidget uploadImage={uploadImage} />
          <img
            id="uploadedimage"
            src={formData.image || ""}
            className="upload-image mt-2"
            alt="uploadedimage"
            style={{ display: formData.image ? "block" : "none" }}
          />
        </Form.Group>

        <Row className="mb-3">
          <Form.Group as={Col} controlId="price">
            <Form.Label>Price</Form.Label>
            <Form.Control
              value={formData.price}
              required
              onChange={handleChange}
              type="number"
              placeholder="0"
            />
            {priceError && (
              <span className="error-message">Please add price</span>
            )}
          </Form.Group>

          <Form.Group as={Col} controlId="category">
            <Form.Label>Category</Form.Label>
            {categoryError && (
              <div>
                <span className="error-message">Please check category</span>
              </div>
            )}
            <Col style={{ height: "150px", overflowY: "auto" }}>
              {categories.map((item, idx) => (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.2rem",
                  }}
                >
                  <Form.Check
                    key={idx}
                    type="checkbox"
                    id={`category-${idx}`}
                    label={item.name}
                    value={item.name.toLowerCase()}
                    checked={formData.category.includes(
                      item.name.toLowerCase()
                    )}
                    onChange={onHandleCategory}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    style={{ padding: "0.1rem 0.3rem", fontSize: "0.7rem" }}
                    onClick={() => handleDeleteCategory(item._id)}
                  >
                    -
                  </Button>
                </div>
              ))}
            </Col>
            <Col style={{ marginTop: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h6>Add Category</h6>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={submitNewCategory}
                >
                  Add
                </Button>
              </div>
              <Form.Control
                onChange={handleAddCategory}
                type="string"
                placeholder="Add Category"
                value={addCategory}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Col} controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={handleChange}
              required
            >
              {STATUS.map((item, idx) => (
                <option key={idx} value={item.toLowerCase()}>
                  {item}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Row>
        {mode === "new" ? (
          <Button variant="primary" type="submit">
            Submit
          </Button>
        ) : (
          <Button variant="primary" type="submit">
            Edit
          </Button>
        )}
      </Form>
    </Modal>
  );
};

export default NewItemDialog;
