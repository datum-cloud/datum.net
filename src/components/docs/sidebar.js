import React, { useState } from "react"
import { Link, useStaticQuery, graphql } from "gatsby"

const DocsSidebar = ({ currentPath }) => {
  const [expanded, setExpanded] = useState({});

  const data = useStaticQuery(graphql`
    query DocsSidebarQuery {
      allMdx(
        filter: {
          internal: { contentFilePath: { regex: "/docs/" } }
        }
        sort: {fields: {slug: ASC}}
      ) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              title
            }
            parent {
              ... on File {
                relativePath
                relativeDirectory
                name
              }
            }
          }
        }
      }
    }
  `);

  // Organize docs into a nested structure for sidebar
  const organizeDocs = () => {
    const docsTree = {};
    
    data.allMdx.edges.forEach(({ node }) => {
      const relativeDirectory = node.parent.relativeDirectory;
      const pathSegments = relativeDirectory ? relativeDirectory.split('/') : [];
      
      if (pathSegments.length === 0 || (pathSegments.length === 1 && pathSegments[0] === 'docs')) {
        // Root level docs
        if (!docsTree.root) docsTree.root = [];
        docsTree.root.push(node);
      } else {
        // Nested docs
        let currentLevel = docsTree;
        
        for (let i = 0; i < pathSegments.length; i++) {
          const segment = pathSegments[i];
          if (segment === 'docs') continue; // Skip the 'docs' folder itself
          
          if (!currentLevel[segment]) {
            currentLevel[segment] = {};
          }
          
          currentLevel = currentLevel[segment];
        }
        
        if (!currentLevel.items) currentLevel.items = [];
        currentLevel.items.push(node);
      }
    });
    
    return docsTree;
  };

  const docsTree = organizeDocs();

  const toggleExpand = (section) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderSidebarItems = (items, path = [], level = 0) => {
    if (!items) return null;
    
    // Sort items by title or name
    const sortedItems = items.sort((a, b) => {
      // First check if one is an index file (should come first)
      const aIsIndex = a.parent.name === 'index';
      const bIsIndex = b.parent.name === 'index';
      
      if (aIsIndex && !bIsIndex) return -1;
      if (!aIsIndex && bIsIndex) return 1;
      
      // Then sort by title
      return (a.frontmatter.title || a.parent.name).localeCompare(b.frontmatter.title || b.parent.name);
    });
    
    return (
      <ul className={`pl-${level * 4} ${level === 0 ? '' : 'ml-4 border-l border-gray-200 pl-4'}`}>
        {sortedItems.map((item) => {
          const itemPath = item.fields.slug;
          const isActive = currentPath === itemPath;
          
          return (
            <li key={item.id} className="mb-2">
              <Link
                to={itemPath}
                className={`text-sm hover:text-blue-500 ${
                  isActive ? 'font-bold text-blue-600' : 'text-gray-700'
                }`}
              >
                {item.frontmatter.title || item.parent.name}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderSidebarSections = (tree, level = 0) => {
    return (
      <>
        {tree.root && renderSidebarItems(tree.root, [], level)}
        
        {Object.keys(tree)
          .filter(key => key !== 'root' && key !== 'items')
          .sort()
          .map(section => {
            const isExpanded = expanded[section] !== false; // Default to expanded
            
            return (
              <div key={section} className="mb-4">
                <button
                  onClick={() => toggleExpand(section)}
                  className="flex items-center w-full text-left font-medium text-gray-800 hover:text-blue-500"
                >
                  <span className="mr-2">{isExpanded ? '▼' : '►'}</span>
                  <span className="capitalize">{section.replace(/-/g, ' ')}</span>
                </button>
                
                {isExpanded && (
                  <div className="mt-2">
                    {tree[section].items && renderSidebarItems(tree[section].items, [section], level + 1)}
                    {renderSidebarSections(tree[section], level + 1)}
                  </div>
                )}
              </div>
            );
          })}
      </>
    );
  };

  return (
    <aside className="w-full lg:w-1/4 lg:pr-8 mb-8 lg:mb-0">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-8">
        <h2 className="text-xl font-bold mb-4">Documentation</h2>
        <nav>
          {renderSidebarSections(docsTree)}
        </nav>
      </div>
    </aside>
  );
};

export default DocsSidebar;