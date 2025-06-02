import { useState } from "react";

const Home = () => {


  const [blogs, setBlogs] = useState([
    { title: "Blog1", body: "lorem ipsum dolor sit amet", author: "Author1", id: 1 },
    { title: "Blog2", body: "lorem ipsum dolor sit amet", author: "Author2", id: 2 },
    { title: "Blog3", body: "lorem ipsum dolor sit amet", author: "Author3", id: 3 },
  ]);

  return (
    <div className="home">
      <h2>Home Page</h2>

      {blogs.map((blog) => (
        <div className="blog-preview" key={blog.id}>
          <h2>{blog.title}</h2>
          <p>{blog.body}</p>
          <p>Written by {blog.author}</p>
        </div>
      ))}
    </div>
  );
};

export default Home;
