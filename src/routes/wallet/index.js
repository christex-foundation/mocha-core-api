//@ts-check
import { Hono } from "hono";
import { apiKeyAuth } from "../../middleware/api-key-auth.js";
import { errorHandler } from "../../middleware/error-handler.js";
import { fetchWalletBalance } from "./wallet.js";

const app = new Hono();
app.use("/*", apiKeyAuth);
app.onError(errorHandler);

app.get("/:phone_number", async (c) => {
	const phoneNumber = c.req.param("phone_number");

	const account = await fetchWalletBalance(phoneNumber);
	return c.json({ account });
});

export default app;
