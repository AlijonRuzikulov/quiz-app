import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const BRAND = {
  name: "Millionaire Mind",
  subtitle: "TSI Edition",
  navy: "#2E4E7B",
  gold: "#F3A40B",
  cream: "#F6F3EB",
  sky: "#9CCAEE",
  taupe: "#8B7E74",
  red: "#F15D65",
  green: "#00BF63",
  deep: "#1A2332",
  white: "#FFFFFF",
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "millionaire2026";
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export function useScreenSize() {
  const [width, setWidth] = useState(typeof window === "undefined" ? 1024 : window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile: width < 640, isTablet: width >= 640 && width < 900 };
}
