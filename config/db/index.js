const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect('mongodb+srv://520H0401:520H0401@mycluster.ov1s4.mongodb.net/myCluster?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('Success');
    } catch (error) {
        console.log('Fail')
    }
}

module.exports  = { connect };