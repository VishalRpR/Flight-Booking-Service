const {Booking} = require("../models");
const CrudRepository = require("./crud-repository");

class BookigRepository extends CrudRepository{
    constructor(){
        super(Booking)
    }
}

module.exports=BookigRepository;