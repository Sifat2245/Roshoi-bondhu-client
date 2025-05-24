import { createContext, useContext, useEffect, useState } from "react";

const ThemeConetxt = createContext('light')

export const ThemeProvider = ({children}) => {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );


    useEffect(() =>{
        if(darkMode){
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        }
        else{
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    },[darkMode])

    return (
        <ThemeConetxt.Provider value={{darkMode, setDarkMode}}>
                {children}
        </ThemeConetxt.Provider>
    )
}


export const useDarkMode = () => useContext(ThemeConetxt) 