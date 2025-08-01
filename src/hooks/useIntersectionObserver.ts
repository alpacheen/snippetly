import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [node, setNode] = useState<Element | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const frozen = useRef(false);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    if (observer.current) observer.current.disconnect();
    observer.current = null;

    if (frozen.current || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const isSupported = window.IntersectionObserver;

    if (!isSupported) return;

    observer.current = new IntersectionObserver(([entry]) => {
      setEntry(entry);

      if (freezeOnceVisible && entry.isIntersecting) {
        frozen.current = true;
      }
    }, observerParams);

    observer.current.observe(node);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [node, threshold, root, rootMargin, freezeOnceVisible]);

  const refCallback = useCallback((node: Element | null) => {
    setNode(node);
  }, []);

  return [refCallback, !!entry?.isIntersecting, entry] as const;
}