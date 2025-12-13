function getSystemAddress() {
  let id = localStorage.getItem("system_address");

  if (!id) {
    id = crypto.randomUUID();  // generate unique id
    localStorage.setItem("system_address", id);
  }

  return id;
}

export default getSystemAddress