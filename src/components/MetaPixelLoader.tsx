
import React, { useEffect } from 'react';

const MetaPixelLoader: React.FC = () => {
  useEffect(() => {
    // Only load the Meta/Facebook pixel in production
    if (process.env.NODE_ENV === 'production') {
      // Create a container element for all Facebook Pixel content
      const fbContainer = document.createElement('div');
      fbContainer.id = 'fb-pixel-container';
      
      // Add the Facebook Pixel script directly (no preloading)
      const fbPixelScript = document.createElement('script');
      fbPixelScript.type = 'text/javascript';
      fbPixelScript.innerHTML = `
        !function(f,b,e,v,n,t,s){
          if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '9151671744940732'); 
          fbq('track', 'PageView');
      `;
      document.body.appendChild(fbPixelScript);
      
      // Add noscript element directly to body (not as a preloaded resource)
      const fbNoscript = document.createElement('noscript');
      fbNoscript.innerHTML = `
        <img height="1" width="1" style="display:none" 
          src="https://www.facebook.com/tr?id=9151671744940732&ev=PageView&noscript=1" alt="" />
      `;
      document.body.appendChild(fbNoscript);
      
      // Track page changes if the component stays mounted
      const trackPageChange = () => {
        if (window.fbq) {
          window.fbq('track', 'PageView');
        }
      };
      
      // Track page views when route changes
      window.addEventListener('popstate', trackPageChange);
      
      // Clean up function
      return () => {
        window.removeEventListener('popstate', trackPageChange);
        
        // Remove Facebook Pixel elements on unmount
        if (fbPixelScript && fbPixelScript.parentNode) {
          fbPixelScript.parentNode.removeChild(fbPixelScript);
        }
        
        if (fbNoscript && fbNoscript.parentNode) {
          fbNoscript.parentNode.removeChild(fbNoscript);
        }
        
        // Cleanup any Facebook Pixel queue and functions
        if (window._fbq) {
          delete window._fbq;
        }
        if (window.fbq) {
          delete window.fbq;
        }
      };
    }
    
    return undefined; // Return undefined for non-production environments
  }, []);

  return null;
};

// Add type definitions for the Facebook Pixel
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export default MetaPixelLoader;
