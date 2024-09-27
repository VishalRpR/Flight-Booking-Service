function compareTime(timestring1,timestring2){

    const datetime1=new Date(timestring1);
    const datetime2=new Date(timestring2);
    return datetime1.getTime()>datetime2.getTime();


}

module.exports={
    compareTime
}