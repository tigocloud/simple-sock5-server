import socks5 from "simple-socks";
import dotenv from "dotenv";

dotenv.config();

function log(...logs) {
	console.log("[" + new Date().toLocaleString("zh-TW", { hour12: false }) + "]", ...logs);
}

if (!process.env.SOCK5_SERVER_USERNAME || !process.env.SOCK5_SERVER_PASSWORD) {
	log("SOCK5 credentials are missing.");
	console.error("[ERROR] ");
	process.exit(1);
}
if (!process.env.SOCK5_SERVER_PORT || !process.env.SOCK5_SERVER_BIND) {
	log("SOCK5 server port or bind ip is missing.");
	process.exit(1);
}

const server = socks5.createServer({
	authenticate: function (username, password, socket, callback) {
		if (username !== process.env.SOCK5_SERVER_USERNAME || password !== process.env.SOCK5_SERVER_PASSWORD) {
			return setImmediate(callback, new Error("invalid credentials"));
		}

		return setImmediate(callback);
	},
	connectionFilter: function (destination, origin, callback) {
		if (origin.address === "127.0.0.1") {
			log("denying access from %s:%s", origin.address, origin.port);

			return setImmediate(callback, new Error("access from specified origin is denied"));
		}

		if (destination.address === "10.0.0.1") {
			log("denying access to %s:%s", remote.address, remote.port);

			return setImmediate(callback, new Error("access to specified destination is denied"));
		}

		return setImmediate(callback);
	},
});

server.listen(process.env.SOCK5_SERVER_PORT, process.env.SOCK5_SERVER_BIND, function () {
	log(`SOCKS5 proxy server started on ${process.env.SOCK5_SERVER_BIND}:${process.env.SOCK5_SERVER_PORT}`);
});

server.on("handshake", function (socket) {
	log("new socks5 client from %s:%d", socket.remoteAddress, socket.remotePort);
});

server.on("authenticateError", function (username, err) {
	log("user %s failed to authenticate...", username, err);
});

server.on("proxyConnect", (info, destination) => {
	log("connected to remote server at %s:%d", info.address, info.port);
});

server.on("proxyError", (err) => {
	console.error("unable to connect to remote server");
	console.error(err);
});

server.on("proxyDisconnect", (originInfo, destinationInfo, hadError) => {
	log(
		"client %s:%d request has disconnected from remote server at %s:%d with %serror",
		originInfo.address,
		originInfo.port,
		destinationInfo.address,
		destinationInfo.port,
		hadError ? "" : "no "
	);
});

server.on("proxyEnd", (response, args) => {
	log("socket closed with code %d", response);
	log(args);
});

console.log(`/*---------------------------------------------------------*\\`);
console.log(` | Simple Sock5 Server | Version 20241106B1     By.Dark495 |`);
console.log(` | Project created on 2024-11-06        https://dark495.me |`);
console.log(` |                                                         |`);
console.log(` | LICENSE: WTFPL Version 2.                               |`);
console.log(` | https://github.com/tigocloud/simple-sock5-server        |`);
console.log(`\\*---------------------------------------------------------*/\n`);
