import { useState } from "react";
import { Bell, Menu, X, User } from "lucide-react";
import { Link } from "react-router-dom";
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-transparent text-black shadow-xl fixed top-0 left-0 z-50">
      <div className="max-w-7xl my-0 mx-auto px-4 py-3 flex items-center justify-between">
       <img className="w-10 h-10" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Port_City_International_University_Logo.png/250px-Port_City_International_University_Logo.png" alt="" />

        <ul className="hidden md:flex items-center gap-6 text-black font-medium">
          <li className="hover:text-blue-600 cursor-pointer">Home</li>
          <li className="hover:text-blue-600 cursor-pointer">Notices</li>
          <li className="hover:text-blue-600 cursor-pointer">Routine</li>
          <li className="hover:text-blue-600 cursor-pointer">Departments</li>
          <li className="hover:text-blue-600 cursor-pointer">Contact</li>
        </ul>

        <div className="hidden md:flex items-center gap-4">

          <button className="relative text-gray-600 hover:text-blue-600">
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              3
            </span>
          </button>

          <button 
            variant="outline"
            className="flex gap-2 items-center w-full bg-[#1B31A3] border px-4 py-2 rounded-md text-white"
          >
            <User size={18} />
           <Link to='/login'>Login</Link>
          </button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <ul className="flex flex-col gap-4 px-6 py-4 text-gray-700 font-medium">
            <li className="hover:text-blue-600">Home</li>
            <li className="hover:text-blue-600">Notices</li>
            <li className="hover:text-blue-600">Routine</li>
            <li className="hover:text-blue-600">Departments</li>
            <li className="hover:text-blue-600">Contact</li>

            <hr />

            <button className="flex items-center gap-2 text-left">
              <Bell size={18} /> Notifications
            </button>

            <button variant="outline" className="w-full">
              Login
            </button>
          </ul>
        </div>
      )}
    </nav>
  );
}
