'use client'

import React from "react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navigation = () => {
  const pathName = usePathname();

  return (
    <nav className="p-1">
      <ul className="flex space-x-4">
        <li><Link href="/" className={ (pathName=='/') ? 'pointer-events-none text-white-600' : 'text-gray-400 hover:underline' } aria-disabled={(pathName=='/')}>Home</Link></li>
        <li><Link href="/blog" className={ (pathName=='/blog') ? 'pointer-events-none text-white-600' : 'text-gray-400 hover:underline' }>Blog</Link></li>
        <li><Link href="/about" className={ (pathName=='/about') ? 'pointer-events-none text-white-600' : 'text-gray-400 hover:underline' }>About</Link></li>
        <li><Link href="/contact" className={ (pathName=='/contact') ? 'pointer-events-none text-white-600' : 'text-gray-400 hover:underline' }>Contact</Link></li>
        <li><Link href="/changelog" className={ (pathName=='/changelog') ? 'pointer-events-none text-white-600' : 'text-gray-400 hover:underline' }>Changelog</Link></li>
      </ul>
    </nav>
  )
}

export default Navigation