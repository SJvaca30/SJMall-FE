import React, { useEffect, useState } from "react";
import { Badge, Button, Col, Form, Modal, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  createProduct,
  deleteCategory,
  editProduct,
  getCategories,
  putCategories,
} from "../../../features/product/productSlice";
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
  console.log("NewItemDialog mode:", mode);
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
    if (success) setShowDialog(false);
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
        editProduct({ ...formData, stock: totalStock, id: selectedProduct._id })
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
    <Modal
      show={showDialog}
      onHide={handleClose}
      size="lg"
      centered
      className="product-modal"
    >
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title>
          {mode === "new" ? "새 상품 등록" : "상품 수정"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>SKU</Form.Label>
                <Form.Control
                  type="text"
                  id="sku"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>상품명</Form.Label>
                <Form.Control
                  type="text"
                  id="name"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>가격</Form.Label>
                <Form.Control
                  type="number"
                  id="price"
                  onChange={handleChange}
                  required
                  isInvalid={priceError}
                />
                <Form.Control.Feedback type="invalid">
                  올바른 가격을 입력해주세요
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>이미지</Form.Label>
                <div className="d-grid">
                  <Button
                    variant="outline-secondary"
                    onClick={() =>
                      window.cloudinary.openUploadWidget(
                        {
                          cloud_name:
                            process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
                          upload_preset:
                            process.env.REACT_APP_CLOUDINARY_PRESET,
                        },
                        (error, result) => {
                          if (!error && result.event === "success") {
                            uploadImage(result.info.url);
                          }
                        }
                      )
                    }
                  >
                    이미지 업로드
                  </Button>
                </div>
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="상품 이미지"
                    className="mt-2 img-thumbnail"
                    style={{ maxHeight: "150px" }}
                  />
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>카테고리</Form.Label>
                <div className="d-flex gap-2 mb-2">
                  <Form.Control
                    type="text"
                    value={addCategory}
                    onChange={handleAddCategory}
                    placeholder="새 카테고리"
                  />
                  <Button variant="outline-primary" onClick={submitNewCategory}>
                    추가
                  </Button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {categories.map((item) => (
                    <Badge
                      bg="secondary"
                      key={item._id}
                      className="p-2 d-flex align-items-center"
                    >
                      {item.name}
                      <Button
                        variant="link"
                        className="p-0 ms-2 text-white"
                        onClick={() => handleDeleteCategory(item._id)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>상품 설명</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              id="description"
              onChange={handleChange}
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              취소
            </Button>
            <Button variant="primary" type="submit">
              {mode === "new" ? "등록" : "수정"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default NewItemDialog;
