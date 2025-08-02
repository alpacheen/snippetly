export function EnhancedAccessibility() {
    useEffect(() => {
      // Skip to main content link
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-lightGreen focus:text-primary focus:rounded';
      skipLink.setAttribute('aria-label', 'Skip to main content');
      document.body.insertBefore(skipLink, document.body.firstChild);
  
      // Announce route changes to screen readers
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.id = 'route-announcer';
      document.body.appendChild(announcer);
  
      // Enhanced focus management
      const handleFocusVisible = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-navigation');
        }
      };
  
      const handleMouseDown = () => {
        document.body.classList.remove('keyboard-navigation');
      };
  
      document.addEventListener('keydown', handleFocusVisible);
      document.addEventListener('mousedown', handleMouseDown);
  
      return () => {
        document.removeEventListener('keydown', handleFocusVisible);
        document.removeEventListener('mousedown', handleMouseDown);
      };
    }, []);
  
    return null;
  }