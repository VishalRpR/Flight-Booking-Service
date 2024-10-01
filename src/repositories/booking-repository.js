const { StatusCodes } = require("http-status-codes");
const {Booking} = require("../models");
const AppError = require("../utils/errors/app-error");
const CrudRepository = require("./crud-repository");
const {Enums}=require('../utils/common');
const { Op } = require("sequelize");
const {CANCELLED,BOOKED,PENDING}=Enums.BOOKING_STATUS;


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
        const response=await Booking.findByPk(data,{transaction:transaction});
        if(!response){
            throw new AppError('unable to find the resourse',StatusCodes.NOT_FOUND);
        }

        return response;

    }

    async update(id,data,transaction){
        const response=await Booking.update(data,{
            where:{
                id:id
            }
        },{transaction:transaction});

        return response;
    }


    async cancelOldBooking(timestamp){
        console.log("in repo");
        const response=await Booking.update({status:CANCELLED},{
            where:{
                [Op.and]:[
                {
                    createdAt:{
                    [Op.lt]:timestamp
                    }
                },

                {
                    status:{
                    [Op.ne]:BOOKED
                    }
                },

                {   status:{
                    [Op.ne]:CANCELLED
                    }
                }


                ]
            }
        })

        return response;

    }
}

module.exports=BookigRepository;