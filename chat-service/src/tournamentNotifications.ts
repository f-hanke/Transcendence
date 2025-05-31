import { AuthServiceTypes, matchmakingTypeGuards } from 'transcendence';
import { databaseQuerys } from './databaseQuerys.js';
import { db, getLanguage, sendToClient, updateUnreadMessages } from "./server.js";
import { MatchMakingTypes } from 'transcendence';
import { GameResultTypes } from 'transcendence';
import { ChatServiceTypes } from 'transcendence';

function	getPlayerName(id: string){
	try {
		const result = db.prepare(databaseQuerys.getUsername).get(id) as {username: string};
		return result.username;
	} catch (err) {
		console.error("error fetching username from db");
		return "default name";
	}
}

function format(template: string, data: Record<string, string | number>): string {
	return template.replace(/\${(.*?)}/g, (_, key) => String(data[key]));
}

function	generateTournamentMessage(type: string, data: MatchMakingTypes.Tournament, clientId: string){
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
		console.warn(`No tournamentmatch result found for type: ${type}`);
		return `[Tournament Notification] - No results found for ${type}.`;
	}
	const player1Name = getPlayerName(matchResult.player1Id);
	const player2Name = getPlayerName(matchResult.player2Id);
	const winnerName = getPlayerName(matchResult.winnerId);

	const isPlayer1Winner = matchResult.winnerId === matchResult.player1Id;
	const winnerScore = isPlayer1Winner ? matchResult.player1Score : matchResult.player2Score;
	const loserScore = isPlayer1Winner ? matchResult.player2Score : matchResult.player1Score;
	const loserName = isPlayer1Winner ? player2Name : player1Name;

	const msgData = {
		winnerName,
		loserName,
		winnerScore,
		loserScore,
		matchType: type,
	};

	const msg = JSON.stringify(msgData);
	return msg;
}

function sendTournamentNotification(players: string[], type: string, data: MatchMakingTypes.Tournament | MatchMakingTypes.PlayerLeftSinceTournamentStarted | MatchMakingTypes.ServerStartTournament) {
	const date = new Date().toISOString().replace('T', ' ').substring(0, 19);
	players.forEach((player) => {
		let message;
		let msgType: ChatServiceTypes.Message["type"];
		const lang = getLanguage(player) as AuthServiceTypes.Language;
		if (matchmakingTypeGuards.isServerStartTournament(data)){
			message = "tournament Start...";
			msgType = "startTournament";
		} else if (matchmakingTypeGuards.isPlayerLeftSinceTournamentStarted(data)) {
			message = JSON.stringify({playerLeft: getPlayerName(data.playerLeavingId)});
			msgType = "playerLeft";
		} else if (matchmakingTypeGuards.isTournament(data)){
			message = generateTournamentMessage(type, data, player);
			msgType = "matchResult";
		}else
			message = "failed to send Tournament Notification";

		const notification = {
			type: "sentMessage",
			data: {
				authorId: "0",
				recipientId: player,
				message: message,
				date: date,
				type: msgType,
			},
		} as const;
		try {
			db.prepare(databaseQuerys.insertMessage).run("0", player, message, date, msgType);
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

	const remainingPlayers = players.filter((id) => !msg.tournamentData.playersWhoClickedToLeave.includes(id))

	console.log("Handling ", type, " match logic");
	sendTournamentNotification(remainingPlayers, type, data);
}

export function tournamentStartNotification(msg: MatchMakingTypes.ServerStartTournament) {
	const players: string[] = [
		msg.data.player1Id,
		msg.data.player2Id,
		msg.data.player3Id,
		msg.data.player4Id
	].filter((id): id is string => typeof id === 'string');

	sendTournamentNotification(players, "startTournament", msg);
}

export function tournamentPlayerLeftNotification(msg: MatchMakingTypes.PlayerLeftSinceTournamentStarted) {
	const players = [
		msg.tournament.player1Id,
		msg.tournament.player2Id,
		msg.tournament.player3Id,
		msg.tournament.player4Id
	].filter((id): id is string => typeof id === 'string');

	const remainingPlayers = players.filter((id) => !msg.tournament.playersWhoClickedToLeave.includes(id));

	sendTournamentNotification(remainingPlayers, "playerLeft", msg);
}
