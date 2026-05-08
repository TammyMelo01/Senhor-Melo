"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
export function ThemeToggle(){ const [dark,setDark] = useState(false); useEffect(()=>{document.body.classList.toggle("dark", dark)},[dark]); return <button className="icon-button" onClick={()=>setDark(!dark)}>{dark ? <Sun/> : <Moon/>}</button>; }
