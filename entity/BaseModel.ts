import {PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

export abstract class BaseModel{
    toJSON(){
        let ignores = this.constructor[ Symbol.for( this.constructor.name ) ];
        let finalObject = {};

        Object.keys(this).forEach(propName => {
            if (ignores && ignores.indexOf(propName) > -1) return;
            if (this[propName] && this[propName]['toJSON']){
                finalObject[propName] = this[propName].toJSON();
            }
            else{
                finalObject[propName] = this[propName];
            }
        });
        return finalObject;
    }

    valueOf(){
        return this.toJSON();
    }

    toString(){
        return JSON.stringify( this.toJSON() );
    }

    @PrimaryGeneratedColumn()
    id: number;

    @UpdateDateColumn({name:"updatedAt"})
    updatedAt: Date;
}