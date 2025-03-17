
import React, { useEffect } from 'react';

const MetaPixelLoader: React.FC = () => {
  useEffect(() => {
    // Only load the Meta/Facebook pixel in production
    if (process.env.NODE_ENV === 'production') {
      // Create a script element for the Meta/Facebook pixel
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '9151671744940732');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
      
      // Create a noscript element for the Meta/Facebook pixel
      const noscript = document.createElement('noscript');
      const img = document.createElement('img');
      img.height = 1;
      img.width = 1;
      img.style.display = 'none';
      img.src = 'https://www.facebook.com/tr?id=9151671744940732&ev=PageView&noscript=1';
      img.alt = '';
      noscript.appendChild(img);
      document.head.appendChild(noscript);
    }
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return null; // This component doesn't render anything
};

export default MetaPixelLoader;
