import React from "react"
import { Link } from "gatsby"

const Navigation = () => {
  return (
    <nav className="bg-gray-200 p-4">
      <ul className="flex space-x-4">
        <li><Link to="/" className="text-blue-600 hover:underline">Home</Link></li>
        <li><Link to="/blog" className="text-blue-600 hover:underline">Blog</Link></li>
        <li><Link to="/about" className="text-blue-600 hover:underline">About</Link></li>
        <li><Link to="/contact" className="text-blue-600 hover:underline">Contact</Link></li>
        <li><Link to="/changelog" className="text-blue-600 hover:underline">Changelog</Link></li>
        <li><Link to="/docs" className="text-blue-600 hover:underline">Docs</Link></li>
        <li><Link to="/guides" className="text-blue-600 hover:underline">Guides</Link></li>
        <li><Link to="/shop" className="text-blue-600 hover:underline">Shop</Link></li>
        <li><Link to="/admin" className="text-blue-600 hover:underline">Admin</Link></li>
      </ul>
    </nav>
  )
}

export default Navigation
