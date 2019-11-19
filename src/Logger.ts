/*
export const Logger = {
  warning: function(text: string): void {
    console.warn(text);
  },
  error: function(text: string): void {
    console.error(text);
  }
};
*/
const Logger = require('logger-nodejs');
const log = new Logger();
export { log };
