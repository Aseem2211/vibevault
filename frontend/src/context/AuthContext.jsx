import {createContext,useContext,useState,useEffect} from "react";

import { getSession } from "../services/api";
const AuthContext =createContext();
export function AuthProvider({children}){
    const [role,setRole]=useState("user");
    const [userId,setUserId]=useState(null);
    const [isLoggedIn,setIsLoggedIn]=useState(false);
    const [darkMode,setDarkMode]=useState(
        ()=>localStorage.getItem("darkMode")==="true"
    );
    useEffect(()=>{
        getSession()
            .then(res=>{
                setRole(res.role||"user");
                setIsLoggedIn(res.isLoggedIn||false);
                setUserId(res.user?._id||null);         
            })
            .catch(()=>{
                setRole("user");
                setIsLoggedIn(false);
            });
    },[]);
    useEffect(()=>{
        if(darkMode){
            document.documentElement.classList.add("dark");

        }else{
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("darkMode",darkMode);
    },[darkMode]);
    
    return <AuthContext.Provider value={{role,setRole,isLoggedIn,setIsLoggedIn,darkMode,setDarkMode,userId}}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext);
