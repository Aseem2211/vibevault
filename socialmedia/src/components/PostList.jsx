import Post from "./Post";
import{ useContext} from "react";
import {PostList as PostListData} from "../store/PostListstore";
const PostList=()=>{
    const {postList}=useContext(PostListData);
    return(
      <>
        {postList.map((post)=>{
          <Post key={post.id} post={post}/>
        })};

      </>
    );
};
export default PostList;