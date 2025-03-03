// src/components/Aside.js
import React from "react"
import { Link } from "next/link"

const Aside = ({ tableOfContents }) => {
  if (!tableOfContents || tableOfContents.length === 0) return null

  return (
    <aside className="w-full lg:w-1/4 lg:pr-8 mb-8 lg:mb-0 sticky top-8 h-fit">
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Contents</h3>

        <ul className="list-disc pl-5 space-y-2">
        {blogs.map((item, index) => (
            <li key={index} className={`ml-${(item.depth - 1) * 4}`}>
              <Link href={item.url} className="text-blue-600 hover:underline">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export default Aside