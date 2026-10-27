/// <reference types="vite/client" />

// CSS module declarations
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Asset declarations
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}
