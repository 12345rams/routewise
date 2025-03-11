const mongoose = require("mongoose");

const BusSchema = new mongoose.Schema({
    name: { type: String,  },
    busId: { type: String,  unique: true },
    startTime: { type: String },
    endTime: { type: String},
    startLocation: { type: String },
    startCoords: { 
        lat: { type: Number },
        lng: { type: Number}
    },
    endLocation: { type: String, required: true },
    endCoords: { 
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    stops: { type: [String] },
    stopCoords: [{
        lat: { type: Number},
        lng: { type: Number }
    }],
    stoppageTime: { type: Number },
    passengerCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Bus", BusSchema);
