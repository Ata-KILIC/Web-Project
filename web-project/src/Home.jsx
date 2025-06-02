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
      <button onClick = {handleClick}> Click me </button> 
    </div>
  );
};

export default Home;
