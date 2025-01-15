export const getBadgeColor = (status) => {
  if (status === "ACTIVE") {
    return "green";
  }
  if (status === "REJECTED") {
    return "red";
  }
  if (status === "PENDING") {
    return "yellow";
  }
  return "gray";
};
