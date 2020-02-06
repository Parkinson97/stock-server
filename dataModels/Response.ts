

export function JsonResponse(isSuccess:boolean = true, message?:string, data?:any) {
    return (new Response(isSuccess, message, data)).toJSON();
}

export class Response{
    public body:any = {};
    constructor(public isSuccess:boolean = true, message?:string, data?:any) {
        this.body = {
            isSuccessful: isSuccess,
            message: message ?? "",
            payload: data ?? {}
        }
    }
    toJSON(){
        return this.body;
    }
}