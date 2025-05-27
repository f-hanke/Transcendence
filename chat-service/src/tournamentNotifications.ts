import { databaseQuerys } from './databaseQuerys.js';
import { db, sendToClient, updateUnreadMessages } from "./server.js";
import { MatchMakingTypes } from 'transcendence';
import { GameResultTypes } from 'transcendence';

function	getPlayerName(id: string){
	try {
		const result = db.prepare(databaseQuerys.getUsername).get(id) as {username: string};
		return result.username;
	} catch (err) {
		console.error("error fetching username from db");
		return null;
	}
}

function	generateTournamentMessage(type: string, data: MatchMakingTypes.Tournament){
	let msg = "[Tournament Notification] - Match Result\n";

	let matchResult: GameResultTypes.MatchResult | null = null;
	switch (type) {
		case "semifinale1":
			matchResult = data.matchResultSemifinale1;
			type = type.substring(0, 10);
			break;
		case "semifinale2":
			matchResult = data.matchResultSemifinale2;
			type = type.substring(0, 10);
			break;
		case "finale":
			matchResult = data.matchResultFinale;
			break;
		case "bronze":
			matchResult = data.matchResultBronze;
			break;
	}
	if (!matchResult) {
		return `[Tournament Notification] - No results found for ${type}.`;
	}
	const player1Name = getPlayerName(matchResult.player1Id);
	const player2Name = getPlayerName(matchResult.player2Id);
	const winnerName = getPlayerName(matchResult.winnerId);

	const isPlayer1Winner = matchResult.winnerId === matchResult.player1Id;
	const winnerScore = isPlayer1Winner ? matchResult.player1Score : matchResult.player2Score;
	const loserScore = isPlayer1Winner ? matchResult.player2Score : matchResult.player1Score;
	const loserName = isPlayer1Winner ? player2Name : player1Name;

	msg += `${winnerName} won the ${type} match against ${loserName} with a score of ${winnerScore} to ${loserScore}.\n`;
	return msg;
}

function sendTournamentNotification(players: string[], message: string){
	const date = new Date().toISOString().replace('T', ' ').substring(0, 19);
	players.forEach((player) => {
		const notification = {
			type: "sentMessage",
			data: {
				authorId: "0",
				recipientId: player,
				message: message,
				date: date,
				type: null,
			},
		} as const;
		try {
			db.prepare(databaseQuerys.insertMessage).run("0", player, message, date, null);
			console.log("Message inserted successfully");
			updateUnreadMessages(player, "0", true);
		} catch (err) {
			console.error("DB error inserting message:", err);
		}
		sendToClient(player, notification);
	});
}

export function	tournamentResultNotification(msg: MatchMakingTypes.TournamentNotification) {
	const type = msg.updateForMatch;
	const data = msg.tournamentData;
	const players: string[] = [
		data.player1Id,
		data.player2Id,
		data.player3Id,
		data.player4Id
	].filter((id): id is string => typeof id === 'string');

	console.log("TYPE OF NOTIFICATION: ", type);
	const message = generateTournamentMessage(type, data);
	switch (type){
		case "semifinale1":
			console.log("Handling semifinal1 match logic");
			sendTournamentNotification(players, message);
			break;
		case "semifinale2":
			console.log("Handling semifinal2 match logic");
			sendTournamentNotification(players, message);
			break;

		case "finale":
			console.log("Handling final match logic");
			sendTournamentNotification(players, message);
			break;

		case "bronze":
			console.log("Handling bronze match logic");
			sendTournamentNotification(players, message);
			break;
	}
}

export function tournamentStartNotification(msg: MatchMakingTypes.ServerStartTournament) {
	//const data = msg.data;
	const players: string[] = [
		msg.data.player1Id,
		msg.data.player2Id,
		msg.data.player3Id,
		msg.data.player4Id
	].filter((id): id is string => typeof id === 'string');
	const message = "The tournament has started, if you are the Host go to tournaments to schedule the match or wait for the Host to send you a invitation";
	sendTournamentNotification(players, message);
}
