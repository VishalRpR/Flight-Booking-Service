const { StatusCodes } = require("http-status-codes");
const {Booking} = require("../models");
const AppError = require("../utils/errors/app-error");
const CrudRepository = require("./crud-repository");


class BookigRepository extends CrudRepository{
    constructor(){
        super(Booking)
    }


    async createBooking(data,transaction){
        console.log(transaction)
            const response=await Booking.create(data,{transaction:transaction});
            return response;
    }

    async get(data,transaction){
        const response=await this.model.findByPk(data,{transaction:transaction});
        if(!response){
            throw new AppError('unable to find the resourse',StatusCodes.NOT_FOUND);
        }

        return response;

    }

    async update(id,data,transaction){
        const response=await this.model.update(data,{
            where:{
                id:id
            }
        },{transaction:transaction});

        return response;
    }
}

module.exports=BookigRepository;