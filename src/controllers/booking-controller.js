const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services")
const { SuccessResponse, ErrorResponse } = require("../utils/common")

async function createBooking(req,res){

try {
    console.log("body",req.body);
    const result=await BookingService.createBooking({
        flightId:req.body.flightId,
        userId:req.body.userId,
        noofSeats:req.body.noofSeats
    });
   SuccessResponse.data=result;
   return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
           
    
} catch (error) {
    console.log("controller catching")
    ErrorResponse.error = error;
    return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    
}
   
}

async function makePayment(){
    
}


module.exports={
    createBooking
}
