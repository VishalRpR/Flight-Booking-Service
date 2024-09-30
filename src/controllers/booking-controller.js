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

async function makePayment(req,res){
    try {

        const payment=await BookingService.makePayment({
            bookingId:req.body.bookingId,
            userId:req.body.userId,
            totalCost:req.body.totalCost
        })
        SuccessResponse.data=payment;
    return res
           .status(StatusCodes.OK)
           .json(SuccessResponse);

    } catch (error) {
        console.log("controller catching")
        ErrorResponse.error = error;
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse);
    
        
    }
}


module.exports={
    createBooking,
    makePayment
}
