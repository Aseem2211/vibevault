import axios from "axios";

const api = axios.create({
  baseURL:import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const listSellItem = async (formData) => {
  const { data } = await api.post("/api/register/sell", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
export const addRentItem = async (formData) => {
  const { data } = await api.post("/api/register/rent", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
export const updateSellItem = async (id, formData) => {
  const { data } = await api.post(`/api/sell/edit/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateRentItem = async (id, formData) => {
  const { data } = await api.post(`/api/rent/edit/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteSellItem = async (id) => {
  const { data } = await api.post(`/api/sell/delete/${id}`);
  return data;
};


export const getSellItemOrderDetails = async (id) => {
  const { data } = await api.get(`/api/seedetails/${id}`);
  return data;
};
export const getSellItems = async () => {
  const { data } = await api.get("/api/sell");
  return data; // { myItem: [], role: "" }
};

export const getRentItems = async () => {
  const { data } = await api.get("/api/rent");
  return { myItem:data.myitem, user:data.user};
};

/**

 * @param {string} id
 * @param {FormData} formData 
 */

export const editRentItem = async (id, formData) => {
  const { data } = await api.post(`/api/rent/edit/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
export const getSellerOrders=async()=>{
  const {data}=await api.get("/api/seller/orders");
  return data;
}
export const updateOrderStatus=async(orderId,orderStatus)=>{
  const {data}=await api.patch(`/api/seller/orders/${orderId}/status`,{orderStatus});
  return data;
}
export const updateRentOrderStatus = async (rentOrderId, orderStatus) => {
    const { data } = await api.patch(`/api/rent-orders/${rentOrderId}/status`, { orderStatus });
    return data;
};
export const deleteRentItem = async (id) => {
  const { data } = await api.delete(`/api/rent/delete/${id}`);
  return data;
};
