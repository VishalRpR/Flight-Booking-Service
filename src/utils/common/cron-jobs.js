var cron = require('node-cron');
const { BookingService } = require('../../services');

function scheduleCrons(){
    cron.schedule('*/1 * * * *', async() => {
        await BookingService.cancelOldBooking();
        console.log('running a task every minute');
      });
      

}


module.exports=scheduleCrons;