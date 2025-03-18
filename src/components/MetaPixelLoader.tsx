
import React, { useEffect } from 'react';

const MetaPixelLoader: React.FC = () => {
  useEffect(() => {
    // Only load the Meta/Facebook pixel in production
    if (process.env.NODE_ENV === 'production') {
      // Initialize Facebook Pixel without using preload
      const fbPixelScript = document.createElement('script');
      fbPixelScript.innerHTML = `
        !function(f,b,e,v,n,t,s) {
          if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)
        }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
        
        // Initialize with your Pixel ID
        fbq('init', '9151671744940732');
        // Track PageView event
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbPixelScript);
      
      // Add noscript fallback for the pixel
      const noscriptElement = document.createElement('noscript');
      const pixelImg = document.createElement('img');
      pixelImg.height = 1;
      pixelImg.width = 1;
      pixelImg.style.display = 'none';
      pixelImg.src = 'https://www.facebook.com/tr?id=9151671744940732&ev=PageView&noscript=1';
      pixelImg.alt = '';
      noscriptElement.appendChild(pixelImg);
      document.body.appendChild(noscriptElement);
    }
    
    // Cleanup function to remove the pixel code when component unmounts
    return () => {
      if (process.env.NODE_ENV === 'production') {
        // Remove noscript element if it exists
        const noscriptElements = document.querySelectorAll('noscript');
        noscriptElements.forEach(element => {
          if (element.innerHTML.includes('9151671744940732')) {
            element.remove();
          }
        });
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default MetaPixelLoader;
