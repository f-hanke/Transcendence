declare namespace RabbitMQTypes {

	type UserChange = {
		id: string,
		displayName: string | null,
		smallImage: Buffer | null,
		language: ('en' | 'de' | 'fr') | null,
	};
}

function isUserChangeBody(arg: any): arg is RabbitMQTypes.UserChange {
	return (
	typeof arg === "object" &&
	arg !== null &&
	arg.id !== null && typeof arg.id === "string" &&
	(typeof arg.displayName === "string" || arg.displayName === null) &&
	(Buffer.isBuffer(arg.smallImage) || arg.smallImage === null) &&
	(arg.language === null || ['en', 'de', 'fr'].includes(arg.language))
	)
}

const rabbitMQTypeGuards = {
	isUserChangeBody
}

export { RabbitMQTypes, rabbitMQTypeGuards }
