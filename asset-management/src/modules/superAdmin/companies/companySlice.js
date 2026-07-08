import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiInstance from "../../../apis/apiConfig";

export const fetchCompanies = createAsyncThunk(
  "company/fetchCompanies",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiInstance.get("/super-admin/company", { params });
      return response.data; // { success, message, data: { companies, total, ... } }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createCompany = createAsyncThunk(
  "company/createCompany",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiInstance.post("/super-admin/company", data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateCompany = createAsyncThunk(
  "company/updateCompany",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiInstance.put(`/super-admin/company/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteCompany = createAsyncThunk(
  "company/deleteCompany",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiInstance.delete(`/super-admin/company/${id}`);
      return { id, ...response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const companySlice = createSlice({
  name: "company",
  initialState: {
    companies: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload.data.companies || [];
        state.total = action.payload.data.pagination?.total || 0;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        const deletedId = action.payload.id;
        state.companies = state.companies.filter(c => c._id !== deletedId);
      });
  },
});

export default companySlice.reducer;
