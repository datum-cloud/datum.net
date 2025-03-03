import React from "react"

function Footer () {
  return (
    <footer className="bg-blackberry text-white p-4 text-center my-4">
      <p>© {new Date().getFullYear()} Datum Inc. All rights reserved.</p>
    </footer>
  )
}

export default Footer;