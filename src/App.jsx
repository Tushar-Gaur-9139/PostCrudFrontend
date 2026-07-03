import { Route, Routes } from "react-router-dom";
import CreatePost from "./components/CreatePost";
import Post from "./components/Post";
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Post />} />
        <Route path="/create-post" element={<CreatePost />} />
      </Routes>
    </>
  )
}

export default App
