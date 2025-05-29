export namespace databaseQuerys {

	export const	updateFriends = `
			UPDATE friends
			SET status = 'accepted'
			WHERE (user_id1 = ? AND user_id2 = ?)
			OR (user_id1 = ? AND user_id2 = ?)
		`;

	export const	getFriendStatus = `
			SELECT status FROM friends
			WHERE (user_id1 = ? AND user_id2 = ?)
			OR (user_id1 = ? AND user_id2 = ?)
		`;

	export const	getFriendRow = `
			SELECT user_id1, user_id2, status FROM friends
			WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)
		`;

	export const	insertFriend = `
			INSERT INTO friends (user_id1, user_id2, status)
			VALUES (?, ?, 'pending')
		`;

	export const	deleteFriend = `
			DELETE FROM friends
			WHERE (user_id1 = ? AND user_id2 = ?)
			OR (user_id1 = ? AND user_id2 = ?)
		`;

	export const	getBlocking = `
			SELECT user_id1, user_id2 FROM blockings
			WHERE (user_id1 = ? AND user_id2 = ?)
		`;

	export const	deleteBlocking = `
			DELETE FROM blockings
			WHERE (user_id1 = ? AND user_id2 = ?)
		`;

	export const	insertBlocking = `
			INSERT INTO blockings (user_id1, user_id2)
			VALUES (?, ?)
		`;

	export const	updateOnlineStatus = `
			UPDATE users SET online = ? WHERE id = ?
		`;

	export const	insertMessage = `
			INSERT INTO messages (authorId, recipientId, message, date, type)
			VALUES (?, ?, ?, ?, ?)
		`;

	export const	getLastMessage = `
			SELECT message, date
			FROM messages
			WHERE
				(authorId = ? AND recipientId = ?) OR
				(authorId = ? AND recipientId = ?)
			ORDER BY date DESC
			LIMIT 1
		`;

	export const	getUser = `
			SELECT username, id, small_image, online FROM users
		`;

	export const	getUnreadMessage = `
			SELECT unread
			FROM chat_status
			WHERE (user_id = ? AND chat_partner_id = ?)
		`;

	export const	updateUnreadMessage = `
				INSERT INTO chat_status (user_id, chat_partner_id, unread)
				VALUES (?, ?, ?)
				ON CONFLICT(user_id, chat_partner_id) DO UPDATE SET unread = ?
			`;

	export const	getChatHistory = `
			SELECT authorId, recipientId, message, date, type
			FROM messages
			WHERE
				(authorId = ? AND recipientId = ?) OR
				(authorId = ? AND recipientId = ?)
			ORDER BY date ASC
		`;

	export const	updateUserDatabase = `
			INSERT INTO users (id, username, small_image, language)
				VALUES (?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				username = COALESCE(excluded.username, users.username),
				small_image = COALESCE(excluded.small_image, users.small_image),
				language = COALESCE(excluded.language, users.language)
		`;

	export const	getUsername = `
			SELECT username FROM users WHERE id = ?
		`;

	export const	getLanguage = `
			SELECT language FROM users WHERE id = ?
		`;
};
