const { default: axios } = require("axios")
const db = require("../models")
const { ServerConfig } = require("../config");
const AppError = require('../utils/errors/app-error');
const BookigRepository = require("../repositories/booking-repository");
const { StatusCodes } = require("http-status-codes");

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
        const booking=await bookingRepository.create(bookingPayload,transaction);

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





module.exports={
    createBooking
    
}