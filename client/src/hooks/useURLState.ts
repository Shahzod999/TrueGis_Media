import { useSearchParams } from "react-router";

export const useURLState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setParam = (key: string, value: string | boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, String(value));
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const deleteParam = (key: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    setSearchParams(newParams);
  };

  const getParam = (key: string) => searchParams.get(key);
  const allParams = Object.fromEntries(searchParams.entries());

  return { getParam, setParam, allParams, deleteParam };
};
