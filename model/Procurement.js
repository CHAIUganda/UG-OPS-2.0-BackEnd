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
  category: {
    type: String,
    required: false,
  },
  descOfOther: {
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
  keyObjAsPerWp: {
    type: String,
    required: false,
  },
  keyActivitiesAsPerWp: [String],
  specifications: {
    printingArtAndDesign: {
      quantityToPrint: {
        type: Number,
        required: false,
      },
      description: {
        type: String,
        required: false,
      },
      moreDetailsIfdesignNeeded: {
        type: String,
        required: false,
      },
      accountCode: {
        type: String,
        required: false,
      },
      sampleNeed: {
        type: Boolean,
        default: false,
      },
      colourNeeded: {
        type: String,
        required: false,
      },
      typeOfBinding: {
        type: String,
        required: false,
      },
      typeOfPaper: {
        type: String,
        required: false,
      },
      paperSize: {
        type: String,
        required: false,
      },
      additionalSupportnDocs: [
        {
          name: String,
          desc: String,
          path: String,
        },
      ],
    },
    carHire: {
      typeOfCar: {
        type: String,
        required: false,
      },
      numberOfCars: {
        type: Number,
        required: false,
      },
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
      pickUpLocation: {
        type: Boolean,
        default: false,
      },
      accountCode: {
        type: String,
        required: false,
      },
      additionalSupportnDocs: [
        {
          name: String,
          desc: String,
          path: String,
        },
      ],
    },
    stationary: {
      item: [
        {
          name: String,
          desc: String,
          quantity: String,
        },
      ],
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
      amenitiesRequired: [String],
      locationOfMeeting: {
        type: String,
        required: false,
      },
      accountCode: {
        type: String,
        required: false,
      },
      additionalSupportnDocs: [
        {
          name: String,
          desc: String,
          path: String,
        },
      ],
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
      additionalSupportnDocs: [
        {
          name: String,
          desc: String,
          path: String,
        },
      ],
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
      additionalSupportnDocs: [
        {
          name: String,
          desc: String,
          path: String,
        },
      ],
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
      additionalSupportnDocs: [
        {
          name: String,
          desc: String,
          path: String,
        },
      ],
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
      additionalSupportnDocs: [
        {
          name: String,
          desc: String,
          path: String,
        },
      ],
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
      additionalSupportnDocs: [
        {
          name: String,
          desc: String,
          path: String,
        },
      ],
    },
  },
  response: {
    requires3Quote: {
      type: Boolean,
      default: false,
    },
    recommendedVendor: {
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
          type: String,
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
        path: {
          type: String,
          required: false,
        },
      },
      quote2: {
        vendor: {
          type: String,
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
        path: {
          type: String,
          required: false,
        },
      },
      quote3: {
        vendor: {
          type: String,
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
        path: {
          type: String,
          required: false,
        },
      },
    },
    choosenQuote: {
      quoteNumber: {
        // can be quote1
        type: String,
        required: false,
      },
      comment: {
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
});

// export model procurement with ProcurementSchema
module.exports = mongoose.model('procurement', ProcurementSchema);
