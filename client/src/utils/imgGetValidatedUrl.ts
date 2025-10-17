export const getValidatedUrl = (url: string) =>
  url?.includes("http") ? url : `https://media.admin13.uz${url}`;
