import { Router, useRouter } from "next/router"
import { useEffect } from "react"

export default function useWarningIfUnsavedData (unsavedChanges: boolean) {
  const router = useRouter();
  const confirmMessage = "Your changes have not been saved. Do you want to discard them and leave this page?";

  const handleRouteChangeStart = (url: string) => {
    console.log('Router url' , url);
    console.log('Router.pathname !== url ', router.asPath)
    if (unsavedChanges && router.asPath !== url) {
      if (!window.confirm(confirmMessage)) {
        Router.events.emit('routeChangeError');
        throw 'Route change cancelled. Ignore this error.';
      }
    }
  };

  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    (event || window.event).returnValue = confirmMessage;
    return confirmMessage; // Gecko + Webkit, Safari, Chrome etc.
  };

  useEffect(() => {
    if (unsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      Router.events.on('routeChangeStart', handleRouteChangeStart);
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      Router.events.off('routeChangeStart', handleRouteChangeStart);
    }
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      Router.events.off('routeChangeStart', handleRouteChangeStart);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsavedChanges]);

}