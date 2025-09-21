import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export const useRouterLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  useEffect(() => {
    router.events.on("routeChangeStart", startLoading);
    router.events.on("routeChangeComplete", stopLoading);
    router.events.on("routeChangeError", stopLoading);
    return () => {
      router.events.off("routeChangeStart", startLoading);
      router.events.off("routeChangeComplete", stopLoading);
      router.events.off("routeChangeError", stopLoading);
    };
  }, [router]);

  return isLoading;
};
