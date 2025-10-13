import mongoose from "mongoose";

export interface ILeadForm {
    pageName: string,
    phone: string,
    businessType: any,
    pageLink: string,
    message: string,
}

const leadFormSchema = new mongoose.Schema<ILeadForm>(
    {
        pageName: { type: String, required: true },
        phone: { type: String, required: true },
        businessType: { type: String, required: true },
        pageLink: { type: String, required: true },
        message: { type: String }
    },
    { timestamps: true }
)

export const learFromInfo = mongoose.model<ILeadForm>("leadFormInfo", leadFormSchema)

