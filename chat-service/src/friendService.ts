import { ChatServiceTypes } from "transcendence";
import { db, sendToClient } from "./server.js";
import { databaseQuerys } from "./databaseQuerys.js";


export function	acceptFriendRequest(authorId: string, recipientId: string, type: string){
	try {
		const result = db.prepare(databaseQuerys.updateFriends).run(authorId, recipientId, recipientId, authorId);

		if (result.changes === 0)
			return [400, { reason: 'Friend request not found or already accepted.' }] as const;

		// Notify users via WebSocket
		console.log("friend request successfully accepted");
		sendToClient(recipientId, { type: 'accept', recipientId: authorId} );
		return [200, null] as const;
	}
	catch (err) {
		console.error("Error accepting friend request:", err);
		return [500, { reason: 'Failed to accept friend request' }] as const;
	}
}

export function	sendFriendRequest(authorId: string, recipientId: string, type: string){
	try {
		// Check if they are already friends
		const result = db.prepare(databaseQuerys.getFriendStatus).get(authorId, recipientId, recipientId, authorId) as { status: string };

		if (result)
		{
			if (result.status === 'accepted')
				return [400, { reason: 'You are already friends.' }] as const;

			// Check if there is already a pending request
			// const existingRequest = db.prepare(`
			// 	SELECT * FROM friends
			// 	WHERE (user_id1 = ? AND user_id2 = ? AND status = 'pending')
			// 	OR (user_id1 = ? AND user_id2 = ? AND status = 'pending')
			// `).get(authorId, recipientId, recipientId, authorId);

			if (result.status === 'pending')
				return [400, { reason: 'Friend request already exists or is pending.' }] as const;
		}
		// Insert the request with 'pending' status
		db.prepare(databaseQuerys.insertFriend).run(authorId, recipientId);
		console.log("friend request successfully sent");
		sendToClient(recipientId, { type: "send", recipientId: authorId})
		return [200, null] as const;
	}
	catch (err) {
		console.error("Error sending friend request:", err);
		return [500, { reason: 'Failed to send friend request' }] as const;
	}
}

export function	removeFriendRequest(authorId: string, recipientId: string, type: ChatServiceTypes.UpdateFriendRequest["type"]){
	try {
		const result = db.prepare(databaseQuerys.deleteFriend).run(authorId, recipientId, recipientId, authorId);

		if (result.changes === 0)
			return [400, { reason: 'Friend request not found.' }] as const;

		// Notify users via WebSocket
		console.log(`friend request successfully ${type}`);
		sendToClient(recipientId, { type: type, recipientId: authorId});
		return [200, null] as const;
	}
	catch (err) {
		console.error(`[Error] for friend request ${type}`, err);
		return [500, { reason: 'Failed to reject friend request' }] as const;
	}
}
