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
import { useState } from 'react';
import { Book } from './types';
import CreateAddress from './pages/CreateAddress';
import UpdateAddress from './pages/UpdateAddress';
import Addresses from './pages/Addresses';
import DeleteAddress from './pages/DeleteAddress';
// import OAuthCallback from './components/OAuthCallback';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Orders from './pages/Orderes';

export interface ChildProps {
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
}

const App = () => {
  const [books, setBooks] = useState<Book[]>([]);
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <NavBar books={books} setBooks={setBooks} />
      <Routes>
        <Route path='/' element={<Home books={books} setBooks={setBooks} />} />
        <Route path='/login' element={<Login /> } />
        <Route path='/signup' element={<Signup />} />
        <Route path='/books/create' element={<CreateBook />} />
        <Route path='/books/details/:id' element={<ShowBook />} />
        <Route path='/books/edit/:id' element={<EditBook />} />
        <Route path='/books/delete/:id' element={<DeleteBook />} />
        <Route path='/addresses' element={<Addresses />} />
        <Route path='/address/create' element={<CreateAddress />} />
        <Route path='/address/update/:id' element={<UpdateAddress />} />
        <Route path='/address/delete/:id' element={<DeleteAddress />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/reset-password/verify' element={<ResetPassword />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/orders' element={<Orders />} />
        {/* <Route path='/oauth2/redirect/google' element={<OAuthCallback />} /> */}
      </Routes>   
    </ GoogleOAuthProvider>
  )
}

export default App;