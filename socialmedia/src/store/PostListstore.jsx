import {createContext,useReducer} from "react";
const DEFAULT_CONTEXT={
    postList:[],
    addPost:()=>{},
    deletePost:()=>{}
}
export const PostList=createContext(DEFAULT_CONTEXT);

  
const postListReducer=(currPostList,action)=>{
    if(action.type=='addPost'){
        return [action.payload,...currPostList];

    }else if(action.type=='deletePost'){
        return currPostList.filter(post=>post.id!==action.payload.postId);
    }
    return currPostList;
};
const PostListProvider=({children})=>{
  const [postList,dispatchPostList]=useReducer(postListReducer,DEFAULT_POSTLIST);
  const addPost=()=>{

  }
  const deletePost=()=>{
    
  }
  return <PostList.Provider value={{
    postList:postList,
    addPost:addPost,
    deletePost:deletePost }}
    >{children}</PostList.Provider>
}
 const DEFAULT_POSTLIST=[{
    id:'1',
    title:'Going to mumbai',
    body:'hi there',
    reactions:0,
    userId:'9',
    tags:["vacations"]
 },
 {
    id:'2',
    title:'Going to delhi',
    body:'hello there',
    reactions:0,
    userId:'9',
    tags:["tour"]
 }
];
export default PostListProvider;