import React from "react"
import { Link } from "gatsby"
import { getImage } from "gatsby-plugin-image"

const Featured = ({
    image,
    title,
    description,
    childs,
  }) => {
    const heroImage = getImage(image) || image;
    console.log(childs);
    return (
        <div>

            <h1 className="text-4xl">{title}</h1>
            <p>{description}</p>
            <img src={heroImage} style={{height: 400, width: 400}} alt=""/>
    
            <hr/>
            
            <div className="column is-12 has-text-centered">
                <Link className="btn" to="/blogs">All Blogs</Link>
            </div>

            {childs.blogs.map((data) => (
              <div className="p-3">
                <a href="{data.path}"><b>{data.title}</b></a> 
                <p>{data.description}</p>
              </div>
            ))}
            
        </div>
    );
};

export default Featured