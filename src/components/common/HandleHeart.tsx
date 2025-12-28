import React, { ReactNode, useEffect } from "react";


import { useAppDispatch } from "../../features/hooks";
import { fetchWishlist } from "../../features/product/wishlistSlice";

type Props = {
  children: ReactNode;
};

const AppWrapper: React.FC<Props> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchWishlist()); 
  }, [dispatch]);

  return <>{children}</>;
};

export default AppWrapper;
