import { useEffect } from 'react';

const APP_NAME = 'Gym Routines';

/** Sets the browser tab title for the current page. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`;
  }, [title]);
}
