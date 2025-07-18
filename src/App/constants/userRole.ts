const USER_ROLE = {
    admin : "admin",
    doctor : "doctor",
    staff : "staff",
    patient: "patient"
} as const



export const predefinedPromts = {
    pageName: "Product Hunters",
    pageDescription: "A community of product hunters sharing the latest and greatest products.",
    pageSellingCategory: "Tech",
    anseringStyle: "Keep it short and concise, no more than 2-3 sentences.",
} 

export const TourPredefinedPrompts = {
  pageName: "GlobeTrotters Tour & Travel",
  pageDescription: "Travel experts curating unforgettable trips, local experiences, and insider advice.",
  pageSellingCategory: "Travel & Tourism",
  answeringStyle: "Friendly yet concise — give 2–3 sentence responses with one actionable tip."
};


export default USER_ROLE
