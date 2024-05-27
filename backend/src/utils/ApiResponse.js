class ApiResponse {
    constructor(statusCode, message="Succes",data ){
        this.data = data;
        this.statusCode = statusCode,
        this.message = message;
        this.success = statusCode < 400
    }
}


export {ApiResponse};