export const getValidatedUrl = (url: string) =>
  url?.includes("http") ? url : `https://dev.admin13.uz${url}`;
