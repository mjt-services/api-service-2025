import { getConnection } from "./getConnection";
import { startServer } from "./server";

// Main function to start the service
export const main = async () => {
  await getConnection();
  startServer();
};
