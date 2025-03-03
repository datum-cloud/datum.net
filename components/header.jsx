import React from "react"
import Navigation from "./navigation"
import Image from 'next/image'

function Header() {
  return (
    <header className="flex bg-blackberry-900 text-white m-8">
      <div className="flex">
        <Image
          src="/icon.png"
          width={32}
          height={32}
          alt="logo"
          priority={false}
        />
        <h1 className="text-lg font-bold mr-6">Datum</h1>
      </div>
      <Navigation />
    </header>
  )
}

export default Header;