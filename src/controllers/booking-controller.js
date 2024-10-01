const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services")
const { SuccessResponse, ErrorResponse } = require("../utils/common");



const inMemDb={};//idempotency key memory db


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
           console.log(inMemDb);

        const idempotencyKey=req.headers['x-idempotency-key'];
        if(!idempotencyKey){
           res
             .status(StatusCodes.BAD_REQUEST)
             .json({message:'your idempotency key is missing'})
        }
        

        if(inMemDb[idempotencyKey]){
            res
               .status(StatusCodes.BAD_REQUEST)
               .json({message:'cannot retry on the sucessful payment'})
        }

        

        const payment=await BookingService.makePayment({
            bookingId:req.body.bookingId,
            userId:req.body.userId,
            totalCost:req.body.totalCost
        })

        inMemDb[idempotencyKey]=idempotencyKey;
        SuccessResponse.data=payment;
    return res
           .status(StatusCodes.OK)
           .json(SuccessResponse);

    } catch (error) {
        console.log(error)
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
