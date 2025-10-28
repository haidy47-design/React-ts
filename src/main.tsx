import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/main.css";
import { store } from "./app/store";
import AppRoutes from "./routes/AppRoutes";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Toaster } from "react-hot-toast";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";


const container = document.getElementById("root")!;
const root = createRoot(container);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
    },
  },
});

root.render(
  <React.StrictMode>
  
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppRoutes />
            
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>

  </React.StrictMode>
);


