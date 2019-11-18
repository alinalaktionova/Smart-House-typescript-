export const Logger = {
    warning: function(text: string): void{
        console.warn(text);
    },
    error: function(text: string): never{
        throw new Error(text);
    }
};