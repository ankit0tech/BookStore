// // Example using React and CSS-in-JS (or adapt to your framework)

// // import React from "react";

// const sidebarItems = [
//   { label: "Addresses" },
//   { label: "Cart" },
//   { label: "Orders" },
//   { label: "Wishlist" },
//   { label: "Recently Viewed" },
//   { label: "Categories" },
//   { label: "Offers" },
//   { label: "Add new book" },
//   { label: "Superadmin Panel" },
// ];

// export default function Profile() {
//   return (
//     <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa" }}>
//       {/* Sidebar */}
//       <aside style={{
//         width: 220,
//         background: "#fff",
//         borderRight: "1px solid #e0e0e0",
//         padding: "2rem 1rem",
//         display: "flex",
//         flexDirection: "column",
//         gap: "1rem"
//       }}>
//         <h2 style={{ color: "#7c3aed", marginBottom: "2rem" }}>BookStore</h2>
//         {sidebarItems.map(item => (
//           <button
//             key={item.label}
//             style={{
//               padding: "0.75rem 1rem",
//               background: "#f3f4f6",
//               border: "none",
//               borderRadius: 8,
//               fontSize: "1rem",
//               textAlign: "left",
//               cursor: "pointer",
//               transition: "background 0.2s",
//             }}
//             onMouseOver={e => e.currentTarget.style.background = "#e0e7ff"}
//             onMouseOut={e => e.currentTarget.style.background = "#f3f4f6"}
//           >
//             {item.label}
//           </button>
//         ))}
//       </aside>

//       {/* Main Content */}
//       <main style={{ flex: 1, padding: "2rem" }}>
//         {/* Header */}
//         <header style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: "2rem"
//         }}>
//           <input
//             type="text"
//             placeholder="Search for books, authors, categories..."
//             style={{
//               padding: "0.5rem 1rem",
//               borderRadius: 8,
//               border: "1px solid #e0e0e0",
//               width: 350,
//               fontSize: "1rem"
//             }}
//           />
//           <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
//             <a href="/profile" style={{ color: "#7c3aed", fontWeight: 600 }}>Profile</a>
//             <a href="/cart" style={{ color: "#7c3aed", fontWeight: 600 }}>Cart</a>
//             <span style={{ color: "#374151" }}>user@email.com</span>
//             <a href="/signout" style={{ color: "#ef4444", fontWeight: 600 }}>Sign out</a>
//           </div>
//         </header>
//         {/* Main area can display dashboard stats, recommendations, etc. */}
//         <section>
//           <h3>Welcome to your BookStore dashboard!</h3>
//           <p>Select an option from the sidebar to get started.</p>
//         </section>
//       </main>
//     </div>
//   );
// }





import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../types";


const Dashboard = () => {

    const navigate = useNavigate();
    const userRole = useSelector((state: RootState) => state.userinfo.userRole);
    const handleNavigate = (url: string) => {
        navigate(url);
    }

    const menuItems: {label: string, path: string}[] = [
        { label: 'Addresses', path: '/addresses'},
        { label: 'Cart', path: '/cart'},
        { label: 'Orders', path: '/orders'},
        { label: 'Wishlist', path: '/wishlist'},
        { label: 'Recently Viewed', path: '/recently-viewed'},
        ...(userRole === 'admin' || userRole === 'superadmin' ? [
            { label: 'Categories', path: '/categories'},
            { label: 'Offers', path: '/offers'},
            { label: 'Add new book', path: '/books/create'}
        ] : []),
        ...(userRole === 'superadmin' ? [
            { label: 'Superadmin Panel', path: '/superadmin-panel'}
        ]: [])
    ];


    return (
        <div className="h-full flex">
            <aside className="w-56 p-4 overflow-y-auto h-full">
                <h2 className="text-2xl mb-6 m-2 px-4 py-3"> Dashboard </h2>
                <nav>
                    <ul>
                        {menuItems.map((item) => (
                            <li>
                                <button 
                                    className="w-full text-left m-2 px-4 py-3 border-none rounded-[8px] bg-[#f8f9fa] cursor-pointer transition duration-200 hover:bg-[#e0e7ff]" 
                                    onClick={() => handleNavigate(item.path)}>
                                        {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="p-2 flex-1 overflow-y-auto h-full">
                Main content
            </main>
        </div>
    );

//     return (
//         <div className="p-4">
//             <button 
//                 className="m-2 p-4 border-2 rounded-lg" 
//                 onClick={() => handleNavigate('/addresses')}
//             >
//                 Addresses
//             </button>
            
//             <button 
//                 className="m-2 p-4 border-2 rounded-lg" 
//                 onClick={() => handleNavigate('/cart')}
//             >
//                 Cart
//             </button>
            
//             <button 
//                 className="m-2 p-4 border-2 rounded-lg" 
//                 onClick={() => handleNavigate('/orders')}
//             >
//                 Orders
//             </button>

//             <button
//                 className="m-2 p-4 border-2 rounded-lg" 
//                 onClick={() => handleNavigate('/wishlist')}
//             >
//                 Wishlist
//             </button>

//             <button
//                 className="m-2 p-4 border-2 rounded-lg" 
//                 onClick={() => handleNavigate('/recently-viewed')}
//             >
//                 Recently Viewed
//             </button>

//             {(userRole=='admin' || userRole == 'superadmin') &&
//                 <div>
//                     <button 
//                         className="m-2 p-4 border-2 rounded-lg" 
//                         onClick={() => handleNavigate('/categories')}
//                     >Categories</button>
//                     <button 
//                         className="m-2 p-4 border-2 rounded-lg" 
//                         onClick={() => handleNavigate('/offers')}
//                     >Offers</button>
//                     <button
//                         className="m-2 p-4 border-2 rounded-lg"
//                         onClick={() => handleNavigate('/books/create')}
//                     >Add new book</button>
//                 </div>
//             }

//             {userRole == 'superadmin' ? 
//                 <button className="m-2 p-4 border-2 rounded-lg" onClick={() => handleNavigate('/superadmin-panel')}>Superadmin Panel</button>
//             :
//                 null
//             }
//         </div>
//     );
}

export default Dashboard;