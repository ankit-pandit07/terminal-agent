import { UploadedFile } from "../types/file.types.js";

export interface StorageResult{
    storageKey:string;
    size:number;
}

export interface StorageService{
    upload(file:UploadedFile, storageKey:string):Promise<StorageResult>;
    
    get(storageKey:string):Promise<Buffer>;
    delete(storageKey:string):Promise<void>;
    exists(storageKey:string):Promise<boolean>;
}