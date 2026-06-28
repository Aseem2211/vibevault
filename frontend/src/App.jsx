import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ItemDetail from "./pages/detailpage";
import Books from "./pages/books";
import Appliances from "./pages/appliances";
import Clothes from "./pages/clothes";
import Furniture from "./pages/furniture";
import Snacks from "./pages/snacks";
import Stationary from "./pages/stationary";
import SendOTP from "./pages/sendotp";
import VerifyOTP from "./pages/verifyotp";
import RentItems from "./pages/Rentitems";
import Signup from "./pages/signup";
import ChangePassword from "./pages/changepassword";
import Home from "./pages/home";
import SellerDashboard from "./pages/sellerdashboard";
import Orders from "./pages/order";
import ConfirmRentOrder from "./pages/rentit";
import ConfirmRental from "./pages/rent";
import Login from "./pages/login";
import EditItem from "./pages/edititem";
import EditProfile from "./pages/editprofile";
import EditRentItem from "./pages/editrentitem";
import ConfirmOrder from "./pages/confirmorder";
import Cart from "./pages/cart";
import AddRentItem from "./pages/admin-add-rent";
import RentItem from "./pages/Rentitems";
import RegisterRentForm from "./pages/Register-rent-form";
import SplashScreen from "./pages/SplashScreen";
import Settings from "./pages/settings";
import Search from "./pages/search";
import BuyPage from "./pages/buypage";
import OrderConfirmation from "./pages/confirmbuy";
import SeeDetails from "./pages/SeeDetails";
import SellerOrders from "./pages/sellerorder";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Home */}
          <Route path="/" element={<SplashScreen />}/>
          <Route path="/home" element={<Home />} />
          <Route path="/settings" element={<Settings />}/>
          <Route path="/search" element={<Search/>}/>
          {/* Shop Categories */}
          <Route path="/books"       element={<Books />} />
          <Route path="/appliances"  element={<Appliances />} />
          <Route path="/clothes"     element={<Clothes />} />
          <Route path="/furniture"  element={<Furniture />} />
          <Route path="/snacks"      element={<Snacks />} />
          <Route path="/stationary"  element={<Stationary />} />
          <Route path="/buy/:itemId" element={<BuyPage/>}/>
          <Route path="/confirmation" element={<OrderConfirmation/>}/>
          <Route path="/detailpage/:itemId" element={<ItemDetail/>}/>
          <Route path="/seller/orders" element={<SellerOrders/>}/>
          <Route path="/seedetails/:id" element={<SeeDetails />} />
          {/* Auth */}
          <Route path="/login"          element={<Login />} />
          <Route path="/signup"         element={<Signup />} />
          <Route path="/sendotp"        element={<SendOTP />} />
          <Route path="/verifyotp"      element={<VerifyOTP />} />
          <Route path="/changepassword" element={<ChangePassword />} />

          {/* Cart & Orders */}
          <Route path="/cart"                element={<Cart />} />
          <Route path="/orders"              element={<Orders />} />
          <Route path="/confirm-order/:id"   element={<ConfirmOrder />} />
          <Route path="/confirm-rent/:id"    element={<ConfirmRental />} />
          <Route path="/confirm-rent-order/:id"  element={<ConfirmRentOrder />} />

          {/* Seller */}
          <Route path="/seller"              element={<SellerDashboard />} />
          <Route path="/seller/rent"         element={<RentItems />} />
          <Route path="/seller/add-rent"     element={<AddRentItem />} />
          <Route path="/seller/edit/:id"     element={<EditItem />} />
          <Route path="/item/edit/:id" element={<EditItem/>}/>
          <Route path="/rent/edit/:id"       element={<EditRentItem />} />
          <Route path="/rent"  element={<RentItem/>}/>
          <Route path="register/rent" element={<RegisterRentForm/>}/>
          {/* Profile */}
          <Route path="/buy/:id"     element={<ConfirmOrder />} />   
          <Route path="/sell"        element={<SellerDashboard />} /> 
          <Route path="/profile"     element={<EditProfile />} />     
          <Route path="/edit-profile" element={<EditProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
