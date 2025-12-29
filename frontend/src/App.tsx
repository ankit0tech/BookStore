import { Routes, Route } from 'react-router-dom';
import CreateBook from './pages/CreateBook';
import DeleteBook from './pages/DeleteBook';
import ShowBook from './pages/ShowBook';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { NavBar } from './components/NavBar';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import React, { useState } from 'react';
import { UserBook } from './types';
import CreateAddress from './pages/CreateAddress';
import Addresses from './pages/Addresses';
import DeleteAddress from './pages/DeleteAddress';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import RegisterAdmin from './pages/RegisterAdmin';
import AdminSignup from './pages/AdminSignup';
import AdminLogin from './pages/AdminLogin';
import useAuth from './hooks/useAuth';
import { useSelector } from 'react-redux';
import { RootState } from './types';
import PageNotFound from './pages/PageNotFound';
import AddReview from './pages/AddReview';
import Wishlist from './pages/Wishlist';
import RecentlyViewed from './pages/RecentlyViewed';
import CreateCategory from './pages/category/CreateCategory';
import Categories from './pages/category/Categories';
import Offers from './pages/special_offers/Offers';
import CreateOffer from './pages/special_offers/CreateOffer';
import AddOfferToBook from './pages/AddOfferToBook';
import DashboardHome from './pages/DashboardHome';
import OrderDetails from './pages/OrderDetails';
import OrderManagement from './pages/order_management/OrderManagement';
import ManageOrder from './pages/order_management/ManageOrder';
import SuperAdminHome from './pages/superadmin/SuperAdminHome';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHome from './pages/admin/AdminHome';
import BookManagement from './pages/admin/BookManagement';
import useSyncCart from './hooks/useSyncCart';
import UserManagement from './pages/user_management/UserManagement';
import UserUpdate from './pages/user_management/UserUpdate';


const App = () => {

  const userinfo = useSelector((state: RootState) => state.userinfo);
  const userRole = userinfo.userRole;
  
  useAuth();
  useSyncCart();

  return (
    <div className='h-screen flex flex-col'>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <div className='shrink-0'>      
          <NavBar />
        </div>

        <div className='flex-1 overflow-auto' >  
          <Routes>
            <Route
              path='/' 
                element={<Home />}
            />
            <Route path='/login' element={<Login /> } />
            <Route path='/signup' element={<Signup />} />
            
            <Route path='/admin/signup' element={<AdminSignup />} />
            <Route path='/admin/login' element={<AdminLogin />} />
            
            <Route path='/books/details/:id' element={<ShowBook />} />
            <Route path='/reset-password/verify' element={<ResetPassword />} />
            
            <Route path='/dashboard' element={<Dashboard />} >
              <Route index element={<DashboardHome />} />
              <Route path='addresses' element={<Addresses />} />
              <Route path='address/create' element={<CreateAddress />} />
              <Route path='address/update/:id' element={<CreateAddress />} />
              <Route path='address/delete/:id' element={<DeleteAddress />} />

              <Route path='cart' element={<Cart />} />
              <Route path='orders' element={<Orders />} />
              <Route path='order/:id' element={<OrderDetails />} />
              <Route path='checkout' element={<Checkout />} />
              <Route path='review/:id' element={<AddReview />} />
              <Route path='wishlist' element={<Wishlist />} />
              <Route path='recently-viewed' element={<RecentlyViewed />} />
              
            </Route>
              
            {(userRole === 'admin' || userRole === 'superadmin') && (
                <Route path='/admin-dashboard' element={<AdminDashboard />} >
                  <Route index element={<AdminHome />} />
                  <Route path='categories' element={<Categories />} />
                  <Route path='category/create' element={<CreateCategory />} />
                  <Route path='category/edit/:id' element={<CreateCategory />} />
                  
                  <Route path='offers' element={<Offers />} />
                  <Route path='offer/create' element={<CreateOffer />} />
                  <Route path='offer/edit/:id' element={<CreateOffer />} />
                  <Route path='books/add-offer/:id' element={<AddOfferToBook />} />

                  <Route path='books/details/:id' element={<ShowBook />} />
                  <Route path='books/create' element={<CreateBook />} /> 
                  <Route path='books/edit/:id' element={<CreateBook />} />
                  <Route path='books/delete/:id' element={<DeleteBook />} />
                  <Route path='book-management' element={<BookManagement />} />
                  
                  <Route path='user-management' element={<UserManagement />} />
                  <Route path='users/edit/:id' element={<UserUpdate />} />
                  
                  <Route path='order-management' element={<OrderManagement />} />
                  <Route path='manage-order/:id' element={<ManageOrder />} />
                </Route>
            )}
              
            {(userRole === 'superadmin') && (
              <Route path='/superadmin-dashboard' element={<SuperAdminDashboard />}>
                <Route index element={<SuperAdminHome />} />
                <Route path='register-admin' element={<RegisterAdmin />} />
              </Route>
            )}
              
            
            <Route path='*' element={<PageNotFound />} />
          </Routes>
        </div>
      </ GoogleOAuthProvider>
    </div>
  )
}

export default App;