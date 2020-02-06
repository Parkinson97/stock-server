export class AppError extends Error{
    constructor(message: string, name: string = "AppError") {
        super();
        this.message = message;
        this.name = name;
    }

    static from (e:Error){
        let appError = new AppError(e.message);

        Object.keys(e).forEach(prop => {
            if(prop != "name") appError[prop] = e[prop]
        });

        return appError;
    }
}