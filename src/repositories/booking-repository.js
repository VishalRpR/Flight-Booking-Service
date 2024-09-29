const {Booking} = require("../models");
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

    async get(){

    }
}

module.exports=BookigRepository;