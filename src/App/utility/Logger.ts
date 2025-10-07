export enum LogService {
    DB = "DATABASE",
    API = "API",
    WebHookService = "WEBHOOK_SERVICE",
}

export enum LogPrefix {
    SHOP = "SHOP",
    SHOPS = "SHOPS",

    PRODUCTS = "PRODUCTS",
    PRODUCT = "PRODUCT",

}

export enum LogMessage {

    CONFLICT = "CONFICT",
    
    NOT_FOUND = "NOT FOUND",
    RETRIEVED = "RETRIEVED",

    CREATED = "CREATED",
    NOT_CREATED = "NOT_CREATED",

    UPDATED = "UPDATED",
    NOT_UPDATED = "NOT_UPDATED",

    DELETED = "DELETED",
    NOTE_DELETED = "NOTE_DELETED",

}

export const Logger = (service: string, prefix: string, msg: string):void => {
    console.log(`[${service}]-[${prefix}]: [${msg}]`) 
}