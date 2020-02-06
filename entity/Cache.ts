import {Entity, Column} from "typeorm";
import {BaseModel} from "./BaseModel";

@Entity()
export class Cache extends BaseModel{

    @Column("varchar", {length:255, unique:true})
    key: string;

    @Column("text")
    result: string;

    CheckValid(){
        return !(Date.now() >= this.updatedAt.getTime() + (10*60_000))
    }

}
