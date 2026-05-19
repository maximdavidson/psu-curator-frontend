let searchText = "";
let listeners: ((text: string) => void)[] = [];
export const getSearchText = () => searchText;
export const setSearchText = (text: string) => {
  searchText = text;
  listeners.forEach((listener) => listener(text));
};
export const subscribeToSearch = (callback: (text: string) => void) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
};
