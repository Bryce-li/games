import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'swiper-container': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        ref?: React.RefObject<HTMLElement>;
        init?: string;
      };
      'swiper-slide': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
} 