declare namespace RabbitMQTypes {

	type UserChange = {
		id: string,
		displayName: string,
		smallImage: Buffer
	};
}

function isUserChangeBody(arg: any): arg is RabbitMQTypes.UserChange {
	return (
	typeof arg === "object" &&
	arg !== null &&
	typeof arg.id === "string" &&
	typeof arg.displayName === "string" &&
	Buffer.isBuffer(arg.smallImage)
  )
}

const rabbitMQTypeGuards = {
	isUserChangeBody
}

export { RabbitMQTypes, rabbitMQTypeGuards }
