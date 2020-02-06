import {Entity, Column, OneToOne, JoinTable, ManyToOne, JoinColumn} from "typeorm";
import {User} from "./User";
import {BaseModel} from "./BaseModel";
import {Stock} from "./Stock";

@Entity()
export class Share extends BaseModel{

    @Column("varchar", {length:255, unique:true})
    key: string;

    @Column("datetime")
    quantity: number;

    @Column("varchar", {length:255})
    currency: string;

    @Column("decimal", {precision:16, scale: 4})
    boughtPrice: number;

    @ManyToOne(type =>Stock, stock => stock.shares)
    @JoinTable()
    stock: Stock;

    @OneToOne(type => User, user => user.ownedShares)
    @JoinColumn()
    user: User;

}
