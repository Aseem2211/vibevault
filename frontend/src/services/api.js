import axios from "axios";

const api = axios.create({
  baseURL:import.meta.env.VITE_API_URL,
  withCredentials: true,
});


export const signup = (data) => api.post("/api/signup", data);

export const login = async (formData) => {
  const { data } = await api.post("/api/login", formData);
  return data;
};

export const logout = async () => {
  const { data } = await api.post("/api/logout");
  return data;
};


export const getSession = async () => {
  const { data } = await api.get("/api/session");
  return data;
};


export const sendSignupOTP = async (method) => {
  const { data } = await api.post("/api/sendotp", { method });
  return data;
};

export const verifySignupOTP = async ({ otp }) => {
  const { data } = await api.post("/api/verifyotp", { otp });
  return data;
};
export const searchItems=(params)=>api.get('/api/search',{params});

export const changePasswordWithOld = async ({ oldPassword, newPassword, confirmPassword }) => {
  const { data } = await api.post("/api/changepassword/old", { oldPassword, newPassword, confirmPassword });
  return data;
};

export const sendChangePasswordOTP = async ({method,email}) => {
  const { data } = await api.post("/api/changepassword/sendotp", { method,email });
  return data;
};

export const verifyChangePasswordOTP = async ({ otp, newpassword, confirmpassword }) => {
  const { data } = await api.post("/api/changepassword/verifyotp", { otp, newpassword, confirmpassword });
  return data;
};
export const getItemDetail=(id)=>api.get(`/api/detailpage/${id}`);

export const getItemsBySection = (section) => api.get(`/api/${section}`);


export const getCart        = ()   => api.get("/api/cart");
export const addToCart      = (id) => api.post(`/api/addcart/${id}`);
export const removeFromCart = (id) => api.delete(`/api/cart/remove/${id}`);


export const getOrders   = ()          => api.get("/api/orders");
export const getItemById = (id)        => api.get(`/api/buy/${id}`);
export const placeOrder  = (id, data)  => api.post(`/api/buy/${id}`, data);
export const cancelOrder = (deliveryId) =>
  api.post(`/api/orders/${deliveryId}/cancel`);
export const deleteOrder=(id)=>api.delete(`/api/orders/${id}/delete`);

export const getProfile    = ()     => api.get("/api/profile");
export const updateProfile = (data) => api.post("/api/profile/update", data);


export const updateItem  = (id, formData) => api.post(`/api/item/edit/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteItem  = (id) => api.post(`/api/item/delete/${id}`);
export const getEditItem = (id) => api.get(`/api/item/edit/${id}`);
export const getSellerEditItem = (id) => api.get(`/api/sell/edit/${id}`);

export const addRentItem    = (formData) => api.post("/api/register/rent", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const getRentItemById=(id)=>api.get(`/api/rent/${id}`);
export const placeRentOrder=(data)=>api.post(`/api/rent/order`,data);
export const getBuyerRentOrders  = () => api.get('/api/rent/orders/buyer');
export const getSellerRentOrders = () => api.get('/api/rent/orders/seller');
export const cancelRentOrder = (rentOrderId) =>
    api.post(`/api/rent-orders/${rentOrderId}/cancel`);
export const deleteRentOrder_history=(id)=>api.delete(`/api/rent-orders/${id}/delete`);

export const addReview=(id,data)=>
  api.post(`/api/item/${id}/review`,data);
export const deleteReview=(itemId,reviewId)=>
  api.delete(`/api/item/${itemId}/reviews/${reviewId}`);
export const decreaseStock=(id,data)=>
 api.patch(`/api/item/${id}/stock`,data);
export default api;
