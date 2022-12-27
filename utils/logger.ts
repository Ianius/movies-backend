export namespace Logger {
    export function info(...messages: any[]) {
        console.info("[INFO]:", ...messages);
    }

    export function error(...messages: any[]) {
        console.info("[ERROR]:", ...messages);
    }
}