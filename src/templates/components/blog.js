import React from "react";
// import { Link } from "gatsby";
// import { getImage } from "gatsby-plugin-image";

const Blog = ({
  title,
  description,
  image,
}) => {
  return (
      <section className="section section--gradient">
        {{ title }} - {{ description }}
      </section>
  );
};

export default Blog