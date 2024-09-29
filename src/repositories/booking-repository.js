const {Booking} = require("../models");
const CrudRepository = require("./crud-repository");

class BookigRepository extends CrudRepository{
    constructor(){
        super(Booking)
    }


    async createBooking(){
            const response=await Booking.create(data,{transaction:transaction});
            return response
    }
}

module.exports=BookigRepository;