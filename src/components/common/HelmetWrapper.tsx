import React from "react";
import { Helmet } from "react-helmet-async";

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
    </Helmet>
  );
}


