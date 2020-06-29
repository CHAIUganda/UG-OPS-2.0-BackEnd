// FILENAME : Procurement.js

const mongoose = require('mongoose');

const ProcurementSchema = mongoose.Schema({
  pId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  gId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  objectCode: {
    type: String,
    required: false,
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  category: [String],
  descOfOther: {
    // if categories include other then decs needed.
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
    printingArtAndDesign: {
      item: [
        {
          quantityToPrint: String,
          description: String,
          moreDetailsIfdesignNeeded: String,
          sampleNeed: Boolean,
          colourNeeded: String,
          typeOfBinding: String,
          typeOfPaper: String,
          paperSize: String,
        },
      ],
      accountCode: {
        type: String,
        required: false,
      },
      datesNeeded: {
        from: {
          // datetime format  2020-05-18
          type: Date,
          required: false,
        },
        to: {
          // datetime format  2020-05-18
          type: Date,
          required: false,
        },
      },
    },
    carHire: {
      item: [
        {
          typeOfCar: String,
          numberOfCars: String,
        },
      ],
      districtsToVisit: [String],
      durationOfTrip: {
        daysNo: {
          type: Number,
          required: false,
        },
        nightsNo: {
          type: Number,
          required: false,
        },
      },
      pickUpTime: {
        type: String,
        required: false,
      },
      datesNeeded: {
        from: {
          // datetime format  2020-05-18
          type: Date,
          required: false,
        },
        to: {
          // datetime format  2020-05-18
          type: Date,
          required: false,
        },
      },
      pickUpLocation: {
        type: String,
        default: false,
      },
      accountCode: {
        type: String,
        required: false,
      },
    },
    stationary: {
      item: [
        {
          name: String,
          desc: String,
          quantity: String,
        },
      ],
      datesNeeded: {
        from: {
          // datetime format  2020-05-18
          type: Date,
          required: false,
        },
        to: {
          // datetime format  2020-05-18
          type: Date,
          required: false,
        },
      },
      accountCode: {
        type: String,
        required: false,
      },
    },
    conferenceFacilities: {
      meetingDuraton: {
        type: String,
        required: false,
      },
      numberOfParticipants: {
        type: Number,
        required: false,
      },
      datesNeeded: {
        from: {
          // datetime format  2020-05-18
          type: Date,
          required: false,
        },
        to: {
          // datetime format  2020-05-18
          type: Date,
          required: false,
        },
      },
      amenitiesRequired: [String],
      locationOfMeeting: {
        type: String,
        required: false,
      },
      accountCode: {
        type: String,
        required: false,
      },
    },
    accomodation: {
      guestNames: [String],
      servicesRequired: [String],
      transport: {
        transportRequired: {
          // if true from and to needed
          type: Boolean,
          default: false,
        },
        from: {
          type: String,
          required: false,
        },
        to: {
          type: String,
          required: false,
        },
      },
      accountCode: {
        type: String,
        required: false,
      },
      datesNeeded: {
        from: {
          // datetime format  2020-05-18
          type: Date,
          required: false,
        },
        to: {
          // datetime format  2020-05-18
          type: Date,
          required: false,
        },
      },
    },
    dataCollectors: {
      dateOfOrientation: {
        type: Date,
        required: false,
      },
      numberOfICsRequired: {
        type: Number,
        required: false,
      },
      districtsToVisit: [String],
      venueOfOrientation: {
        type: String,
        required: false,
      },
      specialInstructions: {
        type: String,
        required: false,
      },
      accountCode: {
        type: String,
        required: false,
      },
    },
    computerAndAccessories: {
      item: [
        {
          name: String,
          descOfSpecs: String,
          quantity: String,
        },
      ],
      specialInstructions: {
        type: String,
        required: false,
      },
      accountCode: {
        type: String,
        required: false,
      },
      datesNeeded: {
        from: {
          // datetime format  2020-05-18
          type: Date,
          required: false,
        },
        to: {
          // datetime format  2020-05-18
          type: Date,
          required: false,
        },
      },
    },
    medicalEquipment: {
      item: [
        {
          equipmentType: String,
          itemSpecs: String,
          quantity: String,
        },
      ],
      specialInstructions: {
        type: String,
        required: false,
      },
      accountCode: {
        type: String,
        required: false,
      },
    },
    other: {
      item: [
        {
          name: String,
          itemSpecs: String,
          quantity: String,
        },
      ],
      specialInstructions: {
        type: String,
        required: false,
      },
      accountCode: {
        type: String,
        required: false,
      },
      datesNeeded: {
        from: {
          // datetime format  2020-05-18
          type: Date,
          required: false,
        },
        to: {
          // datetime format  2020-05-18
          type: Date,
          required: false,
        },
      },
    },
  },
  additionalSupportnDocs: [
    {
      name: String,
      desc: String,
      path: String,
    },
  ],
  response: {
    requires3Quote: {
      type: Boolean,
      default: false,
    },
    recommendedVendor: {
      // quote1
      type: String,
      required: false,
    },
    recommendedVendorJustification: {
      type: String,
      required: false,
    },
    quotations: {
      quote1: {
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
        },
        price: {
          type: String,
          required: false,
        },
        available: {
          type: String,
          required: false,
        },
        dates: {
          type: String,
          required: false,
        },
      },
      quote2: {
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
        },
        price: {
          type: String,
          required: false,
        },
        available: {
          type: String,
          required: false,
        },
        dates: {
          type: String,
          required: false,
        },
      },
      quote3: {
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
        },
        price: {
          type: String,
          required: false,
        },
        available: {
          type: String,
          required: false,
        },
        dates: {
          type: String,
          required: false,
        },
      },
    },
    quoteFiles: [
      {
        name: String,
        path: String,
      },
    ],
    choosenQuote: {
      quoteNumber: {
        // can be quote1 quote2 quote3
        type: String,
        required: false,
      },
      comment: {
        // comment required if choose diff from recommended
        type: String,
        required: false,
      },
    },
  },
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
  status: {
    type: String,
    required: true,
    text: true,
  },
  rejectionReason: {
    type: String,
    required: false,
  },
  isModfied: {
    type: Boolean,
    default: false,
  },
  createDate: {
    type: Date,
    // default: Date.now() captures date and time
    required: false,
  },
});

// export model procurement with ProcurementSchema
module.exports = mongoose.model('procurement', ProcurementSchema);
