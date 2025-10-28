import React from "react";
import { Helmet } from "react-helmet";

type HelmetWrapperProps = {
  title?: string;
  description?: string;
};

// Thin wrapper to keep titles/descriptions consistent across pages
export default function HelmetWrapper({ title, description }: HelmetWrapperProps): React.ReactElement {
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
       <link rel="icon" type="image/png" href="/Images/wlogo.png" />
    </Helmet>
  );
}


