// src/components/Aside.js
import React from "react"
import { Link } from "gatsby"

const Aside = ({ tableOfContents }) => {
  if (!tableOfContents?.items || tableOfContents.items.length === 0) return null

  return (
    <aside className="w-full h-fit">
        <h3 className="text-lg font-semibold mb-4">Contents</h3>
        <ul className="list-disc pl-5 space-y-2">
          {tableOfContents.items.map((item, index) => (
            <li key={index} className={`ml-${(item.depth - 1) * 4}`}>
              <Link to={item.url} className="text-blue-600 hover:underline">
                {item.title}
              </Link>
              {/* If items (subheadings) exist, loop through them */}
              {item.items && item.items.length > 0 && (
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {item.items.map((subItem, subIndex) => (
                    <li key={subIndex} className={`ml-${(subItem.depth - 1) * 4}`}>
                      <Link to={subItem.url} className="text-blue-600 hover:underline text-sm">
                        {subItem.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
    </aside>
  )
}

export default Aside