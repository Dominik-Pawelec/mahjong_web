import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ cookies }) => {
	let userId = cookies.get("userId");
	let username = cookies.get("username");

	if (!userId) {
		userId = crypto.randomUUID();
		cookies.set("userId", userId, {
			path: "/",
			maxAge: 60 * 60 * 24 * 30,
			sameSite: "lax",
			httpOnly: false
		});
	}

	if (!username) {
		username = "Mahjong Player";
		cookies.set("username", username, {
			path: "/",
			maxAge: 60 * 60 * 24 * 30,
			sameSite: "lax",
			httpOnly: false
		});
	}

	return { userId, username };
};
