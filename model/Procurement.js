// FILENAME : Procurement.js

const mongoose = require('mongoose');

const ProcurementSchema = mongoose.Schema({
  pId: [mongoose.Schema.Types.ObjectId],
  gId: [mongoose.Schema.Types.ObjectId],
  objectiveId: [mongoose.Schema.Types.ObjectId],
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  category: [String],
  descOfOther: {
    // if categories include other then decs of other needed.
    type: String,
    required: false,
  },
  priceRange: {
    min: {
      type: Number,
      required: false,
    },
    max: {
      type: Number,
      required: false,
    },
  },
  keyObjAsPerWp: {
    type: String,
    required: false,
  },
  keyActivitiesAsPerWp: [String],
  specifications: {
    printingArtAndDesign: [
      {
        quantityToPrint: Number,
        description: String,
        moreDetailsIfdesignNeeded: String,
        sampleNeed: Boolean,
        colourNeeded: String,
        typeOfBinding: String,
        typeOfPaper: String,
        paperSize: String,
        accountCode: String,
        datesNeeded: {
          from: Date,
          to: Date,
        },
        status: String,
        rejectionReason: String,
        isModfied: Boolean,
        additionalSupportnDocs: [
          {
            name: String,
            path: String,
          },
        ],
      },
    ],

    carHire: [
      {
        typeOfCar: String,
        numberOfCars: Number,
        districtsToVisit: [String],
        durationOfTrip: {
          daysNo: Number,
          nightsNo: Number,
        },
        pickUpTime: String,
        pickUpLocation: String,
        accountCode: String,
        datesNeeded: {
          // datetime format  2020-05-18
          from: Date,
          to: Date,
        },
        status: String,
        rejectionReason: String,
        isModfied: Boolean,
        additionalSupportnDocs: [
          {
            name: String,
            path: String,
          },
        ],
      },
    ],
    stationery: [
      {
        name: String,
        desc: String,
        quantity: String,
        accountCode: String,
        datesNeeded: {
          // datetime format  2020-05-18
          from: Date,
          to: Date,
        },
        status: String,
        rejectionReason: String,
        isModfied: Boolean,
        additionalSupportnDocs: [
          {
            name: String,
            path: String,
          },
        ],
      },
    ],

    conferenceFacilities: [
      {
        meetingDuraton: String,
        numberOfParticipants: Number,
        amenitiesRequired: [String],
        locationOfMeeting: String,
        accountCode: String,
        datesNeeded: {
          // datetime format  2020-05-18
          from: Date,
          to: Date,
        },
        status: String,
        rejectionReason: String,
        isModfied: Boolean,
        additionalSupportnDocs: [
          {
            name: String,
            path: String,
          },
        ],
      },
    ],

    accomodation: [
      {
        guestNames: [String],
        servicesRequired: [String],
        transport: {
          transportRequired: Boolean,
          // datetime format  2020-05-18
          from: Date,
          to: Date,
        },
        meetingDuraton: String,
        numberOfParticipants: Number,
        amenitiesRequired: [String],
        locationOfMeeting: String,
        accountCode: String,
        datesNeeded: {
          // datetime format  2020-05-18
          from: Date,
          to: Date,
        },
        status: String,
        rejectionReason: String,
        isModfied: Boolean,
        additionalSupportnDocs: [
          {
            name: String,
            path: String,
          },
        ],
      },
    ],

    dataCollectors: [
      {
        numberOfICsRequired: Number,
        districtsToVisit: [String],
        dateOfOrientation: Date,
        venueOfOrientation: String,
        specialInstructions: String,
        accountCode: String,
        datesNeeded: {
          // datetime format  2020-05-18
          from: Date,
          to: Date,
        },
        status: String,
        rejectionReason: String,
        isModfied: Boolean,
        additionalSupportnDocs: [
          {
            name: String,
            path: String,
          },
        ],
      },
    ],

    computerAndAccessories: [
      {
        name: String,
        descOfSpecs: String,
        quantity: String,
        specialInstructions: String,
        accountCode: String,
        datesNeeded: {
          // datetime format  2020-05-18
          from: Date,
          to: Date,
        },
        status: String,
        rejectionReason: String,
        isModfied: Boolean,
        additionalSupportnDocs: [
          {
            name: String,
            path: String,
          },
        ],
      },
    ],

    medicalEquipment: [
      {
        equipmentType: String,
        itemSpecs: String,
        quantity: String,
        specialInstructions: String,
        accountCode: String,
        datesNeeded: {
          // datetime format  2020-05-18
          from: Date,
          to: Date,
        },
        status: String,
        rejectionReason: String,
        isModfied: Boolean,
        additionalSupportnDocs: [
          {
            name: String,
            path: String,
          },
        ],
      },
    ],

    other: [
      {
        name: String,
        itemSpecs: String,
        quantity: String,
        specialInstructions: String,
        accountCode: String,
        datesNeeded: {
          // datetime format  2020-05-18
          from: Date,
          to: Date,
        },
        status: String,
        rejectionReason: String,
        isModfied: Boolean,
        additionalSupportnDocs: [
          {
            name: String,
            path: String,
          },
        ],
      },
    ],
  },
  response: [
    {
      category: [String],
      itemIds: [mongoose.Schema.Types.ObjectId],
      requires3Quote: Boolean,
      recommendedVendor: mongoose.Schema.Types.ObjectId,
      recommendedVendorJustification: String,
      quotations: {
        quote1: {
          vendor: mongoose.Schema.Types.ObjectId,
          price: String,
          available: String,
          dates: String,
          quoteFile: {
            name: String,
            path: String,
          },
        },
        quote2: {
          vendor: mongoose.Schema.Types.ObjectId,
          price: String,
          available: String,
          dates: String,
          quoteFile: {
            name: String,
            path: String,
          },
        },
        quote3: {
          vendor: mongoose.Schema.Types.ObjectId,
          price: String,
          available: String,
          dates: String,
          quoteFile: {
            name: String,
            path: String,
          },
        },
      },
      choosenQuote: {
        // can be quote1 quote2 quote3
        quoteNumber: String,
        // comment required if choose diff from recommended
        comment: String,
      },
    },
  ],
  localPurchaseOrder: {
    reference: {
      type: String,
      required: false,
    },
    issueDate: {
      type: Date,
      required: false,
    },
    attention: {
      type: String,
      required: false,
    },
    mailLpoTo: {
      type: String,
      required: false,
    },
    currency: {
      type: String,
      required: false,
    },
    item: [
      {
        name: String,
        description: String,
        quantity: Number,
        qtyDescription: String,
        accountCode: String,
        unitPrice: Number,
      },
    ],
  },
  goodsReceivedNote: {
    grnNo: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      required: false,
    },
    location: {
      type: String,
      required: false,
    },
    invoice: {
      invoiceNo: {
        type: String,
        required: false,
      },
      path: {
        type: String,
        required: false,
      },
    },
    recievedOn: {
      type: Date,
      // default: Date.now() captures date and time
      required: false,
    },
    supplierName: {
      type: String,
      required: false,
    },
    origin: {
      type: String,
      required: false,
    },
    deliveredBy: {
      type: String,
      required: false,
    },
    receivedBy: {
      type: String,
      required: false,
    },
    unitQtyCondition: [
      {
        name: String,
        description: String,
        quantity: Number,
        condition: String,
        comments: String,
      },
    ],
  },
  createDate: {
    type: Date,
    // default: Date.now() captures date and time
    required: false,
  },
});

// export model procurement with ProcurementSchema
module.exports = mongoose.model('procurement', ProcurementSchema);
