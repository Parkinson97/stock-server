import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany} from "typeorm";
import {Session} from "./session";
import {BaseModel} from "./BaseModel";
import {Share} from "./Share";
import {jsonIgnore} from "../Tools";

@Entity()
export class User extends BaseModel{

    @Column("varchar", {length:255})
    name: string;

    @Column("varchar", {length:255})
    @jsonIgnore()
    passwordHash: string;

    @Column("varchar", {length:255})
    @jsonIgnore()
    salt: string;

    @Column("varchar", {length:255})
    creditCurrency: string;

    @Column("decimal", {precision:16, scale: 4})
    credit: number;

    @OneToMany(type => Share, share => share.user, {cascade:true, eager:true})
    ownedShares: Share[];

    @OneToOne(type => Session, session => session.user, {
        nullable: true,
        cascade:['insert', 'update', 'remove'],
        eager: true
    })
    @JoinColumn()
    @jsonIgnore()
    session: Session;
}
