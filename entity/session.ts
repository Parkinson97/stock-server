import {Entity, Column, OneToOne, BeforeInsert} from "typeorm";
import {User} from "./User";
import {BaseModel} from "./BaseModel";

@Entity()
export class Session extends BaseModel{

    @Column("varchar", {length:255, unique:true})
    key: string;

    @Column("datetime")
    expiry: Date;

    @OneToOne(type => User, user => user.session)
    user: User;

    @BeforeInsert()
    setExpiry(){
        //session okay for an hour
        this.expiry = new Date(Date.now() + (60*60_000))
    }

    CheckValid(minutes:number=60){
        return !(Date.now() >= this.expiry.getTime() + (minutes*60_000))
    }

}
