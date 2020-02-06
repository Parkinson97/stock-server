import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {BaseModel} from "./BaseModel";
import {Share} from "./Share";
import {jsonIgnore} from "../Tools";

@Entity()
export class Stock extends BaseModel{

    @Column("varchar", {length:255})
    symbol: string;

    @Column("varchar", {length:255})
    name: string;

    @Column("varchar", {length:255})
    currency: string;

    @Column("decimal", {precision:16, scale: 4})
    price: number;

    @Column("integer")
    sharesTotal: number;

    @OneToMany(type => Share, share => share.stock)
    @jsonIgnore()
    shares: Share[];

    @Column("datetime")
    lastSync: Date;

    CheckValid(){
        return !(Date.now() >= this.lastSync.getTime() + (60*60_000))
    }
}
