export const SetLocalStorage = (name, data) => {
  localStorage.setItem(name, JSON.stringify(data));
};

export const GetLocalStorage = name => {
  let data = localStorage.getItem(name);
  return JSON.parse(data); 
};
