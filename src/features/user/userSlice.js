import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

export const loginWithEmail = createAsyncThunk(
  "user/loginWithEmail",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("auth/login", { email, password });
      //성공
      //Loginpage
      //토큰저장
      sessionStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      //실패
      // 실패 시 생긴 에러값을 reducer에 저장
      return rejectWithValue(error.error);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "user/loginWithGoogle",
  async (token, { rejectWithValue }) => {}
);

export const logout = () => (dispatch) => {
  // 세션스토리지에서 토큰 제거
  sessionStorage.removeItem('token');
  
  // 유저 상태 초기화
  dispatch(userSlice.actions.clearUser());
};

export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (
    { email, name, password, navigate },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await api.post("/user", { email, name, password });
      // 성공
      // 1. 성공 토스트 메시지 보여주기
      dispatch(
        showToastMessage({
          message: "회원가입이 완료되었습니다.",
          status: "success",
        })
      );
      // 2. 로그인 페이지로 리다이렉트
      navigate("/login");
      return response.data.data;
    } catch (error) {
      // 실패
      // 1. 실패 토스트 메세지
      dispatch(
        showToastMessage({
          message: "회원가입에 실패하였습니다.",
          status: "fail",
        })
      );
      // 2. 에러 상태 저장
      return rejectWithValue(error.error);
    }
  }
);

export const loginWithToken = createAsyncThunk(
  "user/loginWithToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/me" );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    loginError: null,
    registrationError: null,
    success: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.loginError = null;
      state.registrationError = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.loginError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationError = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.registrationError = action.payload;
      })
      .addCase(loginWithEmail.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.loginError = null;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      })
      .addCase(loginWithToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  },
});
export const { clearErrors, clearUser } = userSlice.actions;
export default userSlice.reducer;
