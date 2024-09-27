
const {Flight,Airport,Airplane,City}= require('../models');
const {Sequelize}=require('sequelize');
const CrudRepository=require("./crud-repository");
const db = require('../models');
const { addRowLockOnFlights } = require('./queries');

class FlightRepository extends CrudRepository{



constructor(){
    super(Flight);

}


async getAllFlights(filter,sort){
    const response=await Flight.findAll({
        where:filter,
        order:sort,
        include: [
            {
                model: Airplane,
                required: true,
                as: 'airplaneDetail'
            },
            {
                model: Airport,
                required: true,
                as: 'departureAirport',
                on : {
                    col1: Sequelize.where(Sequelize.col("Flight.departureAirportId"), "=", Sequelize.col("departureAirport.code"))
                },
                include:
                {
                    model:City,
                    required:true
                }
                
            },
            {
                model: Airport,
                required: true,
                as: 'arrivalAirport',
                on : {
                    col1: Sequelize.where(Sequelize.col("Flight.arrivalAirportId"), "=", Sequelize.col("arrivalAirport.code"))
                },
                include:
                {
                    model:City,
                    required:true
                }
            }
        ],
     
            
        
    })


    return response;
    
}






async updateRemainingSeats(flightId,seats,dec=true){
    console.log(flightId,seats,dec)
    const transaction = await db.sequelize.transaction();

    try {

      await db.sequelize.query(addRowLockOnFlights(flightId));
      const flight=await Flight.findByPk(flightId);
      console.log(dec)
      if(+dec){
        await flight.decrement('totalSeats',{by:seats},{transaction: transaction});
        
      }else{
        await flight.increment('totalSeats',{by:seats},{transaction: transaction});
    
      }
      
      await transaction.commit();
      return flight
      
      
    } catch (error) {
      await transaction.rollback();
      throw error;
      
    }
 

    await db.sequelize.query(addRowLockOnFlights(flightId));

    const flight=await Flight.findByPk(flightId);
    console.log(dec)
    if(+dec){
      await flight.decrement('totalSeats',{by:seats});
      
    }else{
      await flight.increment('totalSeats',{by:seats});
  
    }
  
    return flight
    
  }

}

module.exports=FlightRepository;