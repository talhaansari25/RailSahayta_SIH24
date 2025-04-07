
<!-- Registration -->

POST - http://localhost:3001/auth/register

{
    "email" : "sumeetgupta3690@gmail.com",
    "name" : "Sumeet Gupta",
    "password" : "Sumeet@123",
    "currPnr" : "824671984719",
    "mobile" : "9029638307"
}

<!-- Login -->

POST - http://localhost:3001/auth/login

{
  "email": "sumeetgupta3690@gmail.com",
  "password": "Sumeet@123"
}

token - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3M2VlMGJkNTM2NTQ4ZTEzZGEyZTAzMSIsImlhdCI6MTczMjI1NDA3MywiZXhwIjoxNzM0ODQ2MDczfQ.4XN1TKKBuGU9KVCS2hnHHpryvpK1_aXgzluWAfvue6s

{
  "email" : "shashankkyadav15@gmail.com",
  "password" : "Shashank@123"
}

token - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3M2VlMjcwNTM2NTQ4ZTEzZGEyZTA0NSIsImlhdCI6MTczMjI1NDE4OSwiZXhwIjoxNzM0ODQ2MTg5fQ.0PN0A0b81JauE2_1jH3b7wAreROahcEFykEPHVDqHBQ

<!-- Reset Password -->

POST - http://localhost:3001/auth/resetpassword

{
  "email": "sumeetgupta3690@gmail.com"
}

<!-- Admin Login -->

POST - http://localhost:3001/admin/loginadmin

{
    "email" : "mechanicaldept@gmail.com",
    "password" : "Mechanical@123"
}

<!-- Add Staff -->

POST - http://localhost:3002/admin/addstaff

{
    "email" : "Talha Ansari",
    "name" : "Talha",
    "password" : "mechanical123",
    "dept" : "Mechanical",
    "trainNo" : "12480",
    "dutyShift" : "night"
}

<!-- Add Complaint - Single Dept -->

user1 - 6744a486505b78316465a18b
user2 - 6744a4b3505b78316465a18f

POST - http://localhost:3001/user/addcomplaint

{
  "category": "Electricity",
  "subcategory": "Fan",
  "details": "Fan not working properly",
  "ticketDetails": "",
  "pnrNo": "7482799209",
  "media": "image.jpg",
  "metadata": {
    "time": "2024-11-22T10:00:00Z",
    "location": "Bandra"
  },
  "dept": "Electrical",
  "severity": 7,
  "dept2": "",
  "category2": "",
  "trainNo": "12480"
  "userId" : ""
}

<!-- Add Complaint - Cross Dept -->

POST - http://localhost:3001/user/addcomplaint

{
  "category": "Electricity",
  "subcategory": "Fan",
  "details": "Fan not working properly",
  "ticketDetails": "",
  "pnrNo": "7482799209",
  "media": "image.jpg",
  "metadata": {
    "time": "2024-11-22T10:00:00Z",
    "location": "Bandra"
  },
  "dept": "Electrical",
  "severity": 7,
  "dept2": "Mechanical",  
  "category2": "",
  "trainNo": "12480",
  "crossDeptAccept": 01,
  "userId" : ""
}

<!-- Get All User Complaints -->

GET - http://localhost:3001/user/viewusercomp

<!-- Submit Feedback -->

POST - http://localhost:3001/user/submitfeedback

{
  "complaintId": "67401c49d7a02aa2a8573234",
  "feedback": "Service was satisfactory.",
  "rating": 4,
  "sentiment": "0.7274972",
  "level": "Moderate",
  "desc": "Staff was responsive and resolved the issue efficiently."
}

<!-- Reraise Complaint -->

POST - http://localhost:3001/user/reraisecomp

{
    "complaintId" : "674033756158b7f95e890722"
}

<!-- Staff Login -->

POST - http://localhost:3001/staff/loginstaff

{
    "email" : "sandeep.electrical@gmail.com",
    "password" : "electrical123"
}

token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NDAxYTU3OThmMTJiZTM2MDgzZmRmYSIsImlhdCI6MTczMjI5NTY0MSwiZXhwIjoxNzM0ODg3NjQxfQ.fMCeXZSeeCmqYUvYizkO2YtXFgji0oetBpHzFerAMKw

<!-- View Assigned Complaint - Staff -->

GET - http://localhost:3001/staff/assignedcomp

<!-- Update Complaint Status -->

POST - http://localhost:3001/staff/updatecompstatus

{
    "complaintId" : "674033756158b7f95e890722",
    "status" : "Pending"
}

<!-- Get Cookies Details - Staff -->

POST - http://localhost:3001/staff/getcookiesdept

{
  "staffId" : "67401a5798f12be36083fdfa"
}

<!-- Get Staff Profile Details -->

POST - http://localhost:3001/staff/profile

{
  "staffId" : "67401a5798f12be36083fdfa"
}

<!-- Get Department Wise Complaints -->

POST - http://localhost:3002/admin/deptcomp

{
  "dept" : "Electrical"
}

<!-- Get Staff Details Dept Wise -->

http://localhost:3001/admin/getstaffbydept

{
  "dept" : "Electrical"
}
