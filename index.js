import "dotenv/config";
import socks5server from "socks5server";
import net from "net";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.SOCK5_SERVER_USERNAME || !process.env.SOCK5_SERVER_PASSWORD) {
	console.error("[ERROR] SOCK5 credentials are missing.");
	process.exit(1);
}
if (!process.env.SOCK5_SERVER_PORT || !process.env.SOCK5_SERVER_BIND) {
	console.error("[ERROR] SOCK5 server port or bind ip is missing.");
	process.exit(1);
}

const server = new socks5server.socksServer();

server.setSocks5AuthFunc(socks5server.AUTHENTICATION.USERPASS, (username, password, accept, reject) => {
	if (username === process.env.SOCK5_SERVER_USERNAME && password === process.env.SOCK5_SERVER_PASSWORD) {
		accept();
	} else {
		reject();
	}
});

server.on("tcp", (socket, address, port, CMD_REPLY) => {
	console.log(`[CONNECT][TCP] IP = ${address}, Port = ${port}`);
});

server.on("udp", (socket, expectClientAddress, expectClientPort, CMD_REPLY) => {
	console.log(`[CONNECT][UDP] IP = ${expectClientAddress}, Port = ${expectClientPort}`);
});

server.on("error", (e) => {
	console.error("[ERROR]", e);
});
server.on("client_error", (socket, e) => {
	console.error(
		"[ERROR][Client]",
		`${net.isIP(socket.targetAddress) ? "" : "(" + socket.targetAddress + ")"} ${socket.remoteAddress}:${socket.targetPort}`,
		e
	);
});
server.on("socks_error", (socket, e) => {
	console.error(
		"[ERROR][Socket]",
		`${net.isIP(socket.targetAddress) ? "" : "(" + (socket.targetAddress || "unknown") + ")"} ${
			socket.remoteAddress || "unknown"
		}:${socket.targetPort || "unknown"}`,
		e
	);
});

console.log(`/*---------------------------------------------------------*\\`);
console.log(` | Simple Sock5 Server                          By.Dark495 |`);
console.log(` | Project created on 2024-11-06        https://dark495.me |`);
console.log(` |                                                         |`);
console.log(` | LICENSE: WTFPL Version 2.                               |`);
console.log(` | https://github.com/tigocloud/simple-sock5-server        |`);
console.log(`\\*---------------------------------------------------------*/\n`);

server.listen(process.env.SOCK5_SERVER_PORT, process.env.SOCK5_SERVER_BIND, () => {
	console.log(`[INFO] SOCKS5 server listening on ${process.env.SOCK5_SERVER_BIND}:${process.env.SOCK5_SERVER_PORT}`);
});
