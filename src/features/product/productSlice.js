import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

// 비동기 액션 생성
export const getProductList = createAsyncThunk(
  "products/getProductList",
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get("/product", { params: { ...query } });
      if (response.status !== 200) {
        throw new Error(response.error);
      }
      console.log(response);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.error);
    }
  }
);

export const getProductDetail = createAsyncThunk(
  "products/getProductDetail",
  async (id, { rejectWithValue }) => {}
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/product", formData);

      if (response.status !== 200) {
        throw new Error(response.error);
      }
      dispatch(
        showToastMessage({ message: "Success add new Item", status: "success" })
      );
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { dispatch, rejectWithValue }) => {}
);

export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ id, ...formData }, { dispatch, rejectWithValue }) => {}
);

// 카테고리 목록 조회 추가
export const getCategories = createAsyncThunk(
  "products/getCategories",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.get("/category");
      if (response.status !== 200) {
        throw new Error(response.error);
      }

      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const putCategories = createAsyncThunk(
  "products/putCategories",
  async ({ category }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/category", { name: category });
      if (response.status !== 200) {
        throw new Error(response.error);
      }
      console.log(response);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "products/deleteCategory",
  async ({ id }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.delete(`/category/${id}`);
      if (response.status !== 200) {
        throw new Error(response.error);
      }
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 슬라이스 생성
const productSlice = createSlice({
  name: "products",
  initialState: {
    productList: [],
    selectedProduct: null,
    loading: false,
    error: "",
    totalPageNum: 1,
    success: false,
    categories: [],
    categoryLoading: false,
  },
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setFilteredList: (state, action) => {
      state.filteredList = action.payload;
    },
    clearError: (state) => {
      state.error = "";
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.error = "";
        state.loading = false;
        state.success = true;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(putCategories.pending, (state) => {
        state.categoryLoading = true;
      })
      .addCase(putCategories.fulfilled, (state, action) => {
        state.categoryLoading = false;
      })
      .addCase(putCategories.rejected, (state, action) => {
        state.categoryLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteCategory.pending, (state, action) => {
        state.categoryLoading = true;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categoryLoading = false;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.categoryLoading = false;
        state.error = action.payload;
      })
      .addCase(getProductList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductList.fulfilled, (state, action) => {
        state.productList = action.payload.products;
        state.totalPageNum = action.payload.totalPageNum;
        state.loading = false;
        state.error = "";
      })
      .addCase(getProductList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedProduct, setFilteredList, clearError } =
  productSlice.actions;
export default productSlice.reducer;
