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
        <li><Link href="/about" className={ (pathName=='/about') ? 'pointer-events-none text-white-600' : 'text-gray-400 hover:underline' }>About</Link></li>
        <li><Link href="/blog" className={ (pathName=='/blog') ? 'pointer-events-none text-white-600' : 'text-gray-400 hover:underline' }>Blog</Link></li>
        <li><Link href="/changelog" className={ (pathName=='/changelog') ? 'pointer-events-none text-white-600' : 'text-gray-400 hover:underline' }>Changelog</Link></li>
        <li><Link href="/contact" className={ (pathName=='/contact') ? 'pointer-events-none text-white-600' : 'text-gray-400 hover:underline' }>Contact</Link></li>
        <li><Link href="/shop" className={ (pathName=='/shop') ? 'pointer-events-none text-white-600' : 'text-gray-400 hover:underline' }>
          <div className={"flex gap-1 items-center"}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
             Shop
          </div>
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation