import { Routes, Route } from 'react-router-dom';
import CreateBook from './pages/CreateBook';
import DeleteBook from './pages/DeleteBook';
import ShowBook from './pages/ShowBook';
import EditBook from './pages/EditBook';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { NavBar } from './components/NavBar';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import React, { useState } from 'react';
import { Book } from './types';
import CreateAddress from './pages/CreateAddress';
import UpdateAddress from './pages/UpdateAddress';
import Addresses from './pages/Addresses';
import DeleteAddress from './pages/DeleteAddress';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import SuperAdminPanel from './pages/SuperAdminPanel';
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
import DeleteOffer from './pages/special_offers/DeleteOffer';
import AddOfferToBook from './pages/AddOfferToBook';

export interface ChildProps {
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  nextCursor: number | null;
  setNextCursor: React.Dispatch<React.SetStateAction<number|null>>;

}

const App = () => {
  
  const [books, setBooks] = useState<Book[]>([]);
  const [nextCursor, setNextCursor] = useState<number|null>(null);

  const userinfo = useSelector((state: RootState) => state.userinfo);
  const userRole = userinfo.userRole;
  
  useAuth();

  return (
    <div className='h-screen flex flex-col'>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <div className='shrink-0'>      
          <NavBar 
            books={books} setBooks={setBooks} 
            nextCursor={nextCursor} setNextCursor={setNextCursor}
          />
        </div>

        <div className='flex-1 overflow-hidden' >  
          <Routes>
            <Route
              path='/' 
                element={<Home books={books} setBooks={setBooks}
                nextCursor={nextCursor} setNextCursor={setNextCursor}
              />}
            />
            <Route path='/login' element={<Login /> } />
            <Route path='/signup' element={<Signup />} />
            {(userRole == 'admin' || userRole == 'superadmin') &&
            (
              <>
                <Route path='/books/create' element={<CreateBook />} /> 
                <Route path='/books/edit/:id' element={<EditBook />} />
                <Route path='/books/delete/:id' element={<DeleteBook />} />
                <Route path='/categories' element={<Categories />} />
                <Route path='/category/create' element={<CreateCategory />} />
                <Route path='/category/edit/:id' element={<CreateCategory />} />
                <Route path='/offers' element={<Offers />} />
                <Route path='/offer/create' element={<CreateOffer />} />
                <Route path='/offer/edit/:id' element={<CreateOffer />} />
                <Route path='/offer/delete/:id' element={<DeleteOffer />} />
                <Route path='/books/add-offer/:id' element={<AddOfferToBook />} />
              </>
            )}
            <Route path='/admin/signup' element={<AdminSignup />} />
            <Route path='/admin/login' element={<AdminLogin />} />
            {(userRole == 'superadmin') &&
            (
              <>
                <Route path='/superadmin-panel' element={<SuperAdminPanel />} />
                <Route path='/superadmin/register-admin' element={<RegisterAdmin />} />
              </>
            )}
            <Route path='/books/details/:id' element={<ShowBook />} />
            <Route path='/addresses' element={<Addresses />} />
            <Route path='/address/create' element={<CreateAddress />} />
            <Route path='/address/update/:id' element={<UpdateAddress />} />
            <Route path='/address/delete/:id' element={<DeleteAddress />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/reset-password/verify' element={<ResetPassword />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/review/:id' element={<AddReview />} />
            <Route path='/wishlist' element={<Wishlist />} />
            <Route path='/recently-viewed' element={<RecentlyViewed />} />
            
            <Route path='*' element={<PageNotFound />} />
          </Routes>
        </div>
      </ GoogleOAuthProvider>
    </div>
  )
}

export default App;