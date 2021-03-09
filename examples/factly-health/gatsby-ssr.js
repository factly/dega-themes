import React from 'react';

export const onRenderBody = ({ setPostBodyComponents }, pluginOptions) => {
  setPostBodyComponents([
    <script
      async
      defer
      data-domain="health.factly.in"
      src="https://plausible.factly.in/js/index.js"
    ></script>,
  ]);
};