import { Route, Routes } from "react-router-dom";
import CreatePost from "./components/CreatePost";
import EditPost from "./components/EditPost";

import Post from "./components/Post";
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Post />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/edit-post/:id" element={<EditPost />} />\
      </Routes>
    </>
  )
}

export default App
