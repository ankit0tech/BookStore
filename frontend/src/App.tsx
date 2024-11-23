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

export interface ChildProps {
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
}

const App = () => {
  const [books, setBooks] = useState<Book[]>([]);
  return (
    <>
      <NavBar books={books} setBooks={setBooks} />
      <Routes>
        <Route path='/' element={<Home books={books} setBooks={setBooks} />} />
        <Route path='/login' element={<Login /> } />
        <Route path='/signup' element={<Signup />} />
        <Route path='/books/create' element={<CreateBook />} />
        <Route path='/books/details/:id' element={<ShowBook />} />
        <Route path='/books/edit/:id' element={<EditBook />} />
        <Route path='/books/delete/:id' element={<DeleteBook />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/checkout' element={<Checkout />} />
      </Routes>   
    </>
  )
}

export default App;