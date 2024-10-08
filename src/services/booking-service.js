const { default: axios } = require("axios")
const db = require("../models")
const { ServerConfig, Queue } = require("../config");
const AppError = require('../utils/errors/app-error');
const BookigRepository = require("../repositories/booking-repository");
const { StatusCodes } = require("http-status-codes");
const {Enums}=require('../utils/common')
const {CANCELLED,BOOKED,PENDING}=Enums.BOOKING_STATUS;

const bookingRepository=new BookigRepository();
async function createBooking(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        console.log(typeof flight);
        const flightData = flight.data.data;
        if(data.noofSeats > flightData.totalSeats) {
           throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
        }

        const totalBillingAmount=data.noofSeats*flightData.price;
        const bookingPayload={...data,totalCost:totalBillingAmount};
        const booking=await bookingRepository.createBooking(bookingPayload,transaction);

        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,{
            seats:data.noofSeats
        });

        await transaction.commit();
        return booking;
    } catch (error) {

        console.log(error)
        await transaction.rollback();
        throw error;
        
    }

}


async function makePayment(data){
    console.log('make payment called')
    const transaction=await db.sequelize.transaction();
    try {
        const bookingDetails=await bookingRepository.get(data.bookingId,transaction);
        if(bookingDetails.status==CANCELLED){
            throw new AppError('The booking has expired',StatusCodes.BAD_REQUEST)

        }

        console.log(bookingDetails);
        const bookingTime=new Date(bookingDetails.createdAt);
        const currentTime=new Date();
        if(currentTime-bookingTime>300000){
            await cancelBooking(data.bookingId);
            throw new AppError('booking has expired',StatusCodes.BAD_REQUEST);
        }

        if(bookingDetails.totalCost!=data.totalCost){
            throw new AppError('amount of the payment doesnt match',StatusCodes.BAD_REQUEST);
        }

        if(bookingDetails.userId!=data.userId){
            throw new AppError('the corresponding booking doesnt match',StatusCodes.BAD_REQUEST);
        }


        //here we assume that payment is successfull

        await bookingRepository.update(data.bookingId,{status:BOOKED},transaction);
        Queue.sendData({
            recepientEmail: 'cmpn20102a0019@gmail.com',
            subject: 'Flight booked',
            text: `Booking successfully done for the booking ${data.bookingId}`
        })
        await transaction.commit();


        
    } catch (error) {
       
        await transaction.rollback();
        throw error;
        
    }
}


async function cancelBooking(bookingId){
    console.log('in canclelation')
    const transaction=await db.sequelize.transaction();
     try {
        const bookingDetails=await bookingRepository.get(bookingId,transaction);
        console.log(bookingDetails);
        if(bookingDetails.status==CANCELLED){
           await transaction.commit();
            return true;
        }

        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,
            {
                seats:bookingDetails.noofSeats,
                dec:0

           });

           await bookingRepository.update(bookingId,{status:CANCELLED},transaction);
           await transaction.commit();
        
     } catch (error) {
       
        await transaction.rollback();
        throw error;
        
     }


}

async function cancelOldBooking(){
try {

    const Pasttimeblock=(Date.now()-300*1000);
    const response=await bookingRepository.cancelOldBooking(Pasttimeblock);
    return response;

    
} catch (error) {
    
}

}




module.exports={
    createBooking,
    makePayment,
    cancelOldBooking
}