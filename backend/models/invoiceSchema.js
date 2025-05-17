import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required']
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor ID is required']
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, 'Appointment ID is required']
    },
    invoiceNumber: {
        type: String,
        required: [true, 'Invoice number is required'],
        unique: true
    },
    dateIssued: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    items: [{
        description: {
            type: String,
            required: [true, 'Description is required']
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1']
        },
        unitPrice: {
            type: Number,
            required: [true, 'Unit price is required'],
            min: [0, 'Unit price cannot be negative']
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative']
        }
    }],
    subTotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal cannot be negative']
    },
    taxRate: {
        type: Number,
        default: 0,
        min: [0, 'Tax rate cannot be negative']
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: [0, 'Tax amount cannot be negative']
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: [0, 'Discount amount cannot be negative']
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Partially Paid', 'Paid'],
        default: 'Unpaid'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Credit Card', 'Debit Card', 'Insurance', 'Bank Transfer', 'Other'],
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: [0, 'Paid amount cannot be negative']
    },
    notes: {
        type: String
    }
}, { timestamps: true });

// Generate unique invoice number before saving
invoiceSchema.pre('save', async function(next) {
    if (!this.isNew) {
        return next();
    }
    
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get the count of invoices in the current month
    const count = await mongoose.models.Invoice.countDocuments({
        createdAt: {
            $gte: new Date(date.getFullYear(), date.getMonth(), 1),
            $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
        }
    });
    
    // Generate invoice number in format: INV-YY-MM-XXXX
    this.invoiceNumber = `INV-${year}-${month}-${(count + 1).toString().padStart(4, '0')}`;
    
    next();
});

export const Invoice = mongoose.model('Invoice', invoiceSchema);