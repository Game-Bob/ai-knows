import type { Logger } from "./types.js";

export const consoleLogger: Logger = {
    info(message) {
        console.log(message);
    }
};
