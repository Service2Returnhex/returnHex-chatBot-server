# Hospital Management System REST API

This project is a RESTful API for managing a Hospital Management System, developed using Node.js and Express.js.

## Base URL

```
http://localhost:5000/api/v1
```

---

## Endpoints

### User

#### GET `/users`

**Description:**  
 This endpoint retrieves a list of all users registered in the hospital management system. It returns detailed user information including names, emails, roles (Admin, Doctor, Patient, Staff), profile images, and status. The response is structured and ready for use in frontend applications, dashboards, or administrative panels.

- **Response:**
1. Success 200: ✅

```json
{
  "success": true,
  "message": "Users retrieved Successfully",
  "data": [
    {
      "_id": "6805d63affe7fd45121cdbad",
      "name": "Naeem Biswass Niloy",
      "email": "biswass",
      "image": "sample-imgae.jpg",
      "role": "Admin",
      "status": "in-progress",
      "isDeleted": false,
      "roleModel": "Admin",
      "__v": 0
    },
    ...
  ]
}
```

#### GET `/users/:id`

**Description:**  
 Creates a new user with the given details. This can be a doctor, patient, staff, or admin based on the `role` and `roleModel` fields.

- **Response:**
1. Success 200: ✅

```json
{
  "success": true,
  "message": "One User retrieved Successfully",
  "data": {
    "_id": "6805d63affe7fd45121cdbad",
    "name": "Naeem Biswass Niloy",
    "email": "biswass",
    "image": "sample-imgae.jpg",
    "role": "Admin",
    "status": "in-progress",
    "roleModel": "Admin",
    "__v": 0
  }
}
```

2. User Not Found 404: ❌🚫

```json
{
  "status": "error",
  "message": "User Not Found"
}
```

#### POST `/users/create-user`

**Description:**  
 Creates a new user with the given details. This can be a doctor, patient, staff, or admin based on the `role` and `roleModel` fields.

- **Request Body:**
```json
{
  "name": "Rakhi Ummun",
  "email": "mhsfdfgdfU6@gmail.com",
  "password": "1234",
  "image": "sample-image3.jpg",
  "role": "Doctor",
  "status": "in-progress",
  "roleModel": "Doctor"
}
```

- **Response:**
1. Created 201: ✅
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "name": "Rakhi Ummun",
    "email": "mhsfdfgdfU6@gmail.com",
    "password": "$2b$10$XgKNTkBPAvnoUuiBvS4yj.Ne2pt0UHGNK.KB8D2i.gCtDHajmroZC",
    "image": "sample-image3.jpg",
    "role": "Doctor",
    "status": "in-progress",
    "isDeleted": false,
    "roleModel": "Doctor",
    "_id": "6808c1f8d02f10e37a9c7004",
    "__v": 0
  }
}
```

2. Conflict 409: 🔥
```json
{
  "status": "error",
  "message": "User Already Exists"
}
```

3. Bad Request or Empty field 400: ❌🚫
```json
{
  "success": false,
  "message": "Bad Rquest",
  "data": ["Required"]
}
```

#### PATCH `/users/update-user/:id`

**Description:**
This endpoint updates the details of a specific user in the system, identified by their unique user ID. It allows updating fields like name, password, image, role, status, and roleModel.

- **Request Body:**

```json
{
  "name": "Rakhi Ummun",
  "password": "1234",
  "image": "sample-image3.jpg",
  "role": "Doctor",
  "status": "in-progress",
  "roleModel": "Doctor"
}
```

- **Response:**
1. Success 200: ✅
```json
{
  "success": true,
  "message": "One User updated Successfully",
  "data": {
    "_id": "6805d689ffe7fd45121cdbaf",
    "name": "Rakhi Ummun",
    "email": "kh@gmail.com",
    "image": "sample-image3.jpg",
    "role": "Doctor",
    "status": "in-progress",
    "isDeleted": false,
    "roleModel": "Doctor",
    "__v": 0
  }
}
```

2. Not Found 404: ❌🚫
```json
{
    "status": "error",
    "message": "User Not Found!"
}
```

---

### Doctor

#### GET `/doctors`

**Description:**  
Retrieves a list of all doctors registered in the hospital management system. Each entry includes the doctor's user reference, specialization, contact info, and availability status.

- **Response:**
1. Success 200: ✅
```json
{
  "success": true,
  "message": "Doctors retrieved Successfully",
  "data": [
    {
      "_id": "6806442210e97da6d32bd649",
      "user": "6806442210e97da6d32bd647",
      "specialization": "Cardiac",
      "availability": true,
      "gender": "Female",
      "role": "Doctor",
      "contactInfo": "23423423436",
      "__v": 0
    },
    ...
  ]
}

```

#### GET `/doctors/:id`

**Description:**  
Fetches a single doctor's information from the system using the doctor's unique ID. Returns detailed data including user reference, specialization, contact information, gender, availability, and role.

- **Response:**
1. Success 200: ✅
```json
{
  "success": true,
  "message": "One Doctor retrieved Successfully",
  "data": {
    "_id": "6806442210e97da6d32bd649",
    "user": "6806442210e97da6d32bd647",
    "specialization": "Cardiac",
    "availability": true,
    "gender": "Female",
    "role": "Doctor",
    "contactInfo": "23423423436",
    "__v": 0
  }
}
```

2. Not found 404: ❌🚫
```json
{
  "status": "error",
  "message": "Doctor Not Found"
}
```

#### POST `/doctors/create-doctor`

**Description:**
Creates a new doctor in the hospital management system. This process includes both user creation (with login credentials) and doctor profile setup (specialization, contact info, etc.).

- **Request Body:**
```json
{
  "name": "Dr. Goni Arabia",
  "email": "dfjdfksdjfksj@gmail.com",
  "password": "1234",
  "image": "doctor6.img",
  "specialization": "Cardiac",
  "availability": true,
  "gender": "Female",
  "contactInfo": "23423423436"
}
```

- **Response:**
1. Created 201: ✅

```json
{
  "success": true,
  "message": "One Doctor Created Successfully",
  "data": {
    "user": "6808d1a938d01d995a3dedd4",
    "specialization": "Cardiac",
    "availability": true,
    "gender": "Female",
    "role": "Doctor",
    "contactInfo": "23423423436",
    "_id": "6808d1a938d01d995a3dedd6",
    "__v": 0
  }
}
```

2. User Already Exists 409: 🔥
```json
{
  "status": "error",
  "message": "User Already Exists"
}
```

3. Bad Request or Empty field 400: ❌🚫
```json
{
  "success": false,
  "message": "Bad Rquest",
  "data": ["Required"]
}
```

#### PUT `/doctors/update-doctor/:id`

**Description:**
Updates the profile details of an existing doctor in the system. This includes both account information (such as password and image) and professional details (like specialization and contact info).

- **Request Body**
```json
{
  "name": "Dr. Goni Arabia",
  "password": "1234",
  "image": "doctor6.img",
  "specialization": "Cardiac",
  "availability": true,
  "gender": "Female",
  "contactInfo": "23423423436"
}
```

- **Response**
1. Success 201: ✅
```json
{
  "success": true,
  "message": "One Doctor Updated Successfully",
  "data": {
    "_id": "6806442210e97da6d32bd649",
    "user": "6806442210e97da6d32bd647",
    "specialization": "Cardiac",
    "availability": true,
    "gender": "Female",
    "role": "Doctor",
    "contactInfo": "23423423436",
    "__v": 0
  }
}
```

2. Not Found 404: ❌🚫
```json
{
  "status": "error",
  "message": "Doctor Not Found"
}
```

---

### Patient

#### GET `/patients`

**Description:**
Fetches a list of all patients registered in the hospital management system. Each patient record includes personal and contact information along with user linkage.

- **Respone**
1. Success: ✅
```json
{
  "success": true,
  "message": "Patients retrieved Successfully",
  "data": [
    {
      "_id": "680644e710e97da6d32bd650",
      "user": "680644e710e97da6d32bd64e",
      "age": 27,
      "gender": "Female",
      "role": "Patient",
      "contactInfo": "123454554",
      "address": "123454554",
      "__v": 0
    }
  ]
}
```

### GET `/patients/:id`

**Description**
Fetches the detailed information of a specific patient by their unique ID. If the patient does not exist in the database, it returns an error message.

- **Response**
1. Success 200: ✅
```json
{
  "success": true,
  "message": "One patient retrieved Successfully",
  "data": {
    "_id": "680644e710e97da6d32bd650",
    "user": "680644e710e97da6d32bd64e",
    "age": 27,
    "gender": "Female",
    "role": "Patient",
    "contactInfo": "123454554",
    "address": "123454554",
    "__v": 0
  }
}
```

2. Not Found 404: ❌🚫
```json
{
  "status": "error",
  "message": "Patient Not Found!"
}
```

#### POST `/patients/create-patient`

Creates a new patient account along with their profile details. This includes user credentials and personal medical-related info like age, gender, contact, and address.

- **Request Body:**
  ```json
  {
    "name": "Evana Akter Sadiya",
    "email": "evanagsadio@outlook.com",
    "password": "1234",
    "image": "evana-img2.jpg",
    "age": 27,
    "gender": "Female",
    "contactInfo": "123454554",
    "address": "12/8 Mymensingh"
  }
  ```

- **Response**
1. Created 201: ✅
```json
{
  "success": true,
  "message": "One Patient Created Successfully",
  "data": {
    "user": "6808d8e8c7ac0dd2389b8432",
    "age": 27,
    "gender": "Female",
    "role": "Patient",
    "contactInfo": "123454554",
    "address": "123454554",
    "_id": "6808d8e8c7ac0dd2389b8434",
    "__v": 0
  }
}
```

2. User Exists 409: ❗
```json
{
  "status": "error",
  "message": "User Already Exists"
}
```

3. Bad Request or Empty field 400: ❌🚫
```json
{
  "success": false,
  "message": "Bad Rquest",
  "data": ["Required"]
}
```

#### PUT `/patients/update-patient/:id`

**Description**
Updates an existing patient’s profile and user credentials. Useful for changing personal details, contact info, or image.

- **Request Body**
```json
 {
    "name" : "Evana Akter Sadiya",
    "password" : "1234",
    "image" : "evana-img2.jpg",
    "age" : 27,
    "gender" : "Female",
    "contactInfo" : "123454554",
    "address": "12/8 Mymensingh"
}
```

- **Response**
1. success 200: ✅
```json
{
  "success": true,
  "message": "One Patient Updated Successfully",
  "data": {
    "_id": "680644e710e97da6d32bd650",
    "user": "680644e710e97da6d32bd64e",
    "age": 27,
    "gender": "Female",
    "role": "Patient",
    "contactInfo": "123454554",
    "address": "12/8 Mymensingh",
    "__v": 0
  }
}
```

2. not found 404: ❌🚫
```json
{
  "status": "error",
  "message": "Patient Not Found!"
}
```

---

### Staff

#### GET `/staffs`  

**Description**
Fetches a list of all registered staff members in the hospital management system. Returns associated user IDs and contact information.

- **Response**
1. success 200: ✅
```json
{
    "success": true,
    "message": "Staffs retrieved Successfully",
    "data": [
        {
            "_id": "680645e310e97da6d32bd65d",
            "user": "680645e310e97da6d32bd65b",
            "role": "Staff",
            "contactInfo": "323423",
            "__v": 0
        }
    ]
}
```

#### GET `/staffs/:id`  

**Description**
Retrieves detailed information of a specific staff member by their unique Staff ID.

- **Response**
1. success 200: ✅
```json
{
    "success": true,
    "message": "One Staff retrieved Successfully",
    "data": {
        "_id": "680645e310e97da6d32bd65d",
        "user": "680645e310e97da6d32bd65b",
        "role": "Staff",
        "contactInfo": "323423",
        "__v": 0
    }
}
```
2. Not found 404: ❌🚫
```json
{
    "status": "error",
    "message": "Staff Not Found"
}
```

#### POST `/staffs/create-staff` 

**Description**
Creates a new staff user in the system with provided personal and contact information.

- **Request Body**
```json
 {
    "name" : "Radhika Biswass",
    "email" : "rdbigs@gmail.com",
    "password" : "1234",
    "image" : "rd-img2.jpg",
    "contactInfo" : "323423"
}
```
- **Response**
1. created success 201: ✅
```json
{
    "success": true,
    "message": "One Staff Created Successfully",
    "data": {
        "user": "6808dd4bdc4ce591986b8de7",
        "role": "Staff",
        "contactInfo": "323423",
        "_id": "6808dd4bdc4ce591986b8de9",
        "__v": 0
    }
}
```
2. conflict 409: ❗
```json
{
    "status": "error",
    "message": "User Already Exists"
}
```

3. Bad Request or Empty field 400: ❌🚫
```json
{
  "success": false,
  "message": "Bad Rquest",
  "data": ["Required"]
}
```

#### PUT `/staffs/update-staff/:id`

**Description**
Updates details of an existing staff member by their unique staff ID.

- **Request Body**
```json
 {
    "name" : "Radhika Biswass",
    "password" : "1234",
    "image" : "rd-img2.jpg",
    "contactInfo" : "323423"
}
```
- **Response**
1. success 200: ✅
```json
{
    "success": true,
    "message": "One Staff Updated Successfully",
    "data": {
        "_id": "680645e310e97da6d32bd65d",
        "user": "680645e310e97da6d32bd65b",
        "role": "Staff",
        "contactInfo": "323423",
        "__v": 0
    }
}
```
2. not found 404: ❌🚫
```json
{
    "status": "error",
    "message": "Staff Not Found"
}
```

---

### Admin

#### GET `/admin`

**Description**  
Retrieves a list of all users with the Admin role in the system. Each admin's details, including contact information and address, are included.

- **Response**
1. success 200: ✅
```json
{
  "success": true,
  "message": "Admins retrieved Successfully",
  "data": [
    {
      "_id": "68063c21984b0bad48349d38",
      "user": "68063c21984b0bad48349d36",
      "role": "Admin",
      "contactInfo": "323423",
      "address": "Billu/343 Sylhet",
      "__v": 0
    },
    ...
  ]
}
```

#### GET `/admin/:id`  

**Description**
Retrieves a specific admin by their unique ID.

- **Response**
1. success 200: ✅
```json
{
    "success": true,
    "message": "One Admin retrieved Successfully",
    "data": {
        "_id": "68063c21984b0bad48349d38",
        "user": "68063c21984b0bad48349d36",
        "role": "Admin",
        "contactInfo": "323423",
        "address": "Billu/343 Sylhet",
        "__v": 0
    }
}
```
2. Not found 404: ❌🚫
```json
{
    "status": "error",
    "message": "Admin Not Found!"
}
```
#### POST `/admin/create-admin` 

**Description**
This API endpoint creates a new admin user. The request requires the admin’s name, email, password, contact information, and address. Upon successful creation, it returns the newly created admin’s details, including a unique ID.

- **Request Body**
```json
{
    "name" : "Adiba Rumana",
    "email" : "adrm@outlgook.com",
    "password" : "1234",
    "image" : "admin-img6.jpg",
    "contactInfo" : "323423",
    "address": "12/8 Street, Dhaka-1009"
}
```
- **Response**
1. created 201: ✅
```json
{
    "success": true,
    "message": "One Admin Created Successfully",
    "data": {
        "user": "6808e3c087955328ec9a3639",
        "role": "Admin",
        "contactInfo": "323423",
        "address": "12/8 Street, Dhaka-1009",
        "_id": "6808e3c087955328ec9a363b",
        "__v": 0
    }
}
```
2. conflict 409: ❗
```json
{
    "status": "error",
    "message": "User Already Exists"
}
```

3. Bad Request or Empty field 400: ❌🚫
```json
{
  "success": false,
  "message": "Bad Rquest",
  "data": ["Required"]
}
```

#### PUT `/admin/update-admin/:id`  

**Description**
This endpoint updates the information of an existing admin by their ID. You can modify fields such as name, password, image, contact information, and address. It returns the updated admin details upon success.

- **Request Body**
```json
{
    "name" : "Adiba Rumana",
    "password" : "1234",
    "image" : "admin-img6.jpg",
    "contactInfo" : "323423",
    "address": "12/8 Street, Dhaka-1009"
}
```
- **Response**
1. success 200: ✅
```json
{
    "success": true,
    "message": "One Admin Updated Successfully",
    "data": {
        "_id": "68063c21984b0bad48349d38",
        "user": "68063c21984b0bad48349d36",
        "role": "Admin",
        "contactInfo": "323423",
        "address": "12/8 Street, Dhaka-1009",
        "__v": 0
    }
}
```
2. Not found 404: ❌🚫
```json
{
    "status": "error",
    "message": "Admin Not Found!"
}
```

#### DELETE `/admin/delete-staff/:id`  

**Description**
This endpoint deletes a specific staff member by their ID. It marks the associated user as deleted without permanently removing the data, supporting soft-delete functionality.

- **Response**
1. success 200: ✅
```json
{
    "success": true,
    "message": "One Stuff Deleted Successfully",
    "data": {
        "_id": "680645e310e97da6d32bd65d",
        "user": "680645e310e97da6d32bd65b",
        "role": "Staff",
        "contactInfo": "323423",
        "__v": 0
    }
}
```
2. Not found 404: ❌🚫
```json
{
    "status": "error",
    "message": "Staff Not Found"
}
```

#### DELETE `/admin/delete-doctor/:id`  

**Description**
Deletes a specific doctor by ID using a soft-delete mechanism. This ensures the doctor's data remains in the system but is marked as deleted.

- **Response**
1. success 200: ✅
```json
{
    "success": true,
    "message": "One Doctor Deleted Successfully",
    "data": {
        "_id": "68075ca04a321a19e2b31e66",
        "user": "68075ca04a321a19e2b31e64",
        "specialization": "Cardiac",
        "availability": true,
        "gender": "Female",
        "role": "Doctor",
        "contactInfo": "23423423436",
        "__v": 0
    }
}
```
2. Not found 404: ❌🚫
```json
{
    "status": "error",
    "message": "Doctor Not Found"
}
```

#### DELETE `/admin/delete-patient/:id`  

**Description**
Deletes a specific patient by their ID using a soft-delete approach — the patient's record remains in the database but is marked as deleted for administrative tracking.

- **Response**
1. success 200: ✅
```json
{
    "success": true,
    "message": "One Patient Deleted Successfully",
    "data": {
        "_id": "680644e710e97da6d32bd650",
        "user": "680644e710e97da6d32bd64e",
        "age": 27,
        "gender": "Female",
        "role": "Patient",
        "contactInfo": "123454554",
        "address": "12/8 Mymensingh",
        "__v": 0
    }
}
```
2. Not found 404: ❌🚫
```json
{
    "status": "error",
    "message": "Patient Not Found!"
}
```

---

## Notes

- Ensure MongoDB is running locally and the database is properly connected.
- Passwords are stored securely using hashing (not shown in sample responses).
- All endpoints return a `success`, `message`, and `data` field for consistency.

---

## Author

**Hospital Management System API** by Naeem Biswass Niloy
