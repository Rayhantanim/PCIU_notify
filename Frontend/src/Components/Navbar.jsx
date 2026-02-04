import { useState } from "react";
import { Bell, Menu, X, User } from "lucide-react";
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600">PCIU Notify</div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
          <li className="hover:text-blue-600 cursor-pointer">Home</li>
          <li className="hover:text-blue-600 cursor-pointer">Notices</li>
          <li className="hover:text-blue-600 cursor-pointer">Routine</li>
          <li className="hover:text-blue-600 cursor-pointer">Departments</li>
          <li className="hover:text-blue-600 cursor-pointer">Contact</li>
        </ul>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-4">
          {/* Notification */}
          <button className="relative text-gray-600 hover:text-blue-600">
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              3
            </span>
          </button>

          {/* Profile */}
          <button
            variant="outline"
            className="flex gap-2 items-center w-full border px-4 py-2 rounded-md hover:bg-gray-100"
          >
            <User size={18} />
            Login
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
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
